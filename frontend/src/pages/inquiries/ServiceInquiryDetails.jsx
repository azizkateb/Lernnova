import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, MessageSquare, Send, Paperclip, Download, FileText, Image } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  downloadServiceInquiryMessageAttachment,
  getServiceInquiryById,
  sendServiceInquiryMessage,
} from '../../api/serviceInquiriesApi';
import Loader from '../../components/common/Loader';
import ErrorState from '../../components/common/ErrorState';
import Avatar from '../../components/common/Avatar';
import { cn } from '../../utils/cn';
import { downloadBlob } from '../../utils/downloadHelper';

const extractInquiry = (res) => res?.inquiry || res?.data?.inquiry || res?.data || res;

const extractMessages = (inquiry) => {
  if (!inquiry) return [];
  if (Array.isArray(inquiry?.messages)) return inquiry.messages;
  if (Array.isArray(inquiry?.data?.messages)) return inquiry.data.messages;
  return [];
};

const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;
const ALLOWED_ATTACHMENT_EXTENSIONS = new Set([
  'jpg',
  'jpeg',
  'png',
  'webp',
  'gif',
  'pdf',
  'zip',
  'rar',
  'doc',
  'docx',
  'txt',
]);

const getExtension = (filename) => {
  if (!filename || typeof filename !== 'string') return '';
  const idx = filename.lastIndexOf('.');
  if (idx === -1) return '';
  return filename.slice(idx + 1).toLowerCase();
};

const isImageMimeType = (mime) => typeof mime === 'string' && mime.startsWith('image/');

const isAllowedConversationAttachment = (file) => {
  if (!file) return false;
  const ext = getExtension(file.name);
  if (ext && ALLOWED_ATTACHMENT_EXTENSIONS.has(ext)) return true;
  const mime = (file.type || '').toLowerCase();
  if (!mime) return false;
  if (mime.startsWith('image/')) return ['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(mime);
  return [
    'application/pdf',
    'application/zip',
    'application/x-zip-compressed',
    'application/x-rar-compressed',
    'application/vnd.rar',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
  ].includes(mime);
};

const formatFileSize = (bytes) => {
  const value = Number(bytes);
  if (!Number.isFinite(value) || value <= 0) return '';
  const units = ['B', 'KB', 'MB', 'GB'];
  let idx = 0;
  let size = value;
  while (size >= 1024 && idx < units.length - 1) {
    size /= 1024;
    idx += 1;
  }
  const decimals = idx === 0 ? 0 : idx === 1 ? 0 : 1;
  return `${size.toFixed(decimals)} ${units[idx]}`;
};

const ServiceInquiryDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, isRTL } = useLanguage();

  const [inquiry, setInquiry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [sending, setSending] = useState(false);
  const [imagePreviews, setImagePreviews] = useState({});

  const fileInputRef = useRef(null);
  const imagePreviewsRef = useRef({});

  const messages = useMemo(() => extractMessages(inquiry), [inquiry]);

  const otherUser = useMemo(() => {
    if (!inquiry || !user) return null;
    const buyer = inquiry?.buyer;
    const seller = inquiry?.seller;
    if (buyer?.id && buyer.id === user.id) return seller || null;
    if (seller?.id && seller.id === user.id) return buyer || null;
    return seller || buyer || null;
  }, [inquiry, user]);

  const fetchInquiry = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getServiceInquiryById(id);
      setInquiry(extractInquiry(res));
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401) {
        navigate('/login');
        return;
      }
      setError(err?.response?.data?.message || err.message || 'Failed to load inquiry');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiry();
  }, [id]);

  useEffect(() => {
    imagePreviewsRef.current = imagePreviews;
  }, [imagePreviews]);

  useEffect(() => {
    return () => {
      const current = imagePreviewsRef.current || {};
      Object.values(current).forEach((url) => {
        try {
          URL.revokeObjectURL(url);
        } catch {
        }
      });
    };
  }, []);

  useEffect(() => {
    const requiredIds = new Set(
      messages
        .filter((msg) => msg?.attachment_url && isImageMimeType(msg?.attachment_type))
        .map((msg) => String(msg.id))
    );

    setImagePreviews((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((key) => {
        if (!requiredIds.has(String(key))) {
          try {
            URL.revokeObjectURL(next[key]);
          } catch {
          }
          delete next[key];
        }
      });
      return next;
    });

    let cancelled = false;
    const fetchPreviews = async () => {
      for (const msg of messages) {
        if (cancelled) return;
        if (!msg?.attachment_url || !isImageMimeType(msg?.attachment_type)) continue;
        const key = String(msg.id);
        if (imagePreviewsRef.current?.[key]) continue;
        try {
          const blob = await downloadServiceInquiryMessageAttachment(id, msg.id);
          if (cancelled) return;
          const url = URL.createObjectURL(blob);
          setImagePreviews((prev) => ({ ...prev, [key]: url }));
        } catch {
        }
      }
    };

    fetchPreviews();

    return () => {
      cancelled = true;
    };
  }, [messages, id]);

  const handlePickFile = (isClosed) => {
    if (sending || isClosed) return;
    fileInputRef.current?.click?.();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;
    if (file.size > MAX_ATTACHMENT_BYTES) {
      toast.error(t('conversation.fileTooLarge', 'File is too large. Maximum size is 10MB.'));
      e.target.value = '';
      return;
    }
    if (!isAllowedConversationAttachment(file)) {
      toast.error(t('conversation.unsupportedFile', 'Unsupported file type.'));
      e.target.value = '';
      return;
    }
    setSelectedFile(file);
    e.target.value = '';
  };

  const removeSelectedFile = () => setSelectedFile(null);

  const downloadAttachment = async (msg) => {
    if (!msg?.id) return;
    try {
      const blob = await downloadServiceInquiryMessageAttachment(id, msg.id);
      downloadBlob(blob, msg.attachment_name || 'attachment');
    } catch (err) {
      toast.error(err?.response?.data?.message || t('components.errorState.title', 'Something went wrong'));
    }
  };

  const openImageAttachment = async (msg) => {
    const key = String(msg?.id);
    const url = imagePreviewsRef.current?.[key];
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
      return;
    }
    try {
      const blob = await downloadServiceInquiryMessageAttachment(id, msg.id);
      const nextUrl = URL.createObjectURL(blob);
      setImagePreviews((prev) => ({ ...prev, [key]: nextUrl }));
      window.open(nextUrl, '_blank', 'noopener,noreferrer');
    } catch (err) {
      toast.error(err?.response?.data?.message || t('components.errorState.title', 'Something went wrong'));
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    const value = messageInput.trim();
    if (!value && !selectedFile) return;

    setSending(true);
    try {
      await sendServiceInquiryMessage(id, value || undefined, selectedFile);
      setMessageInput('');
      setSelectedFile(null);
      await fetchInquiry();
    } catch (err) {
      toast.error(err?.response?.data?.message || t('services.inquiry.sendError', 'Could not send message.'));
    } finally {
      setSending(false);
    }
  };

  if (loading) return <Loader fullPage />;
  if (error || !inquiry) return <ErrorState error={error} />;

  const serviceTitle = inquiry?.service?.title || t('common.digitalService', 'Digital Service');
  const heading = t('services.inquiry.title', 'Service inquiry');
  const isClosed = String(inquiry?.status || '').toLowerCase() === 'closed';

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className={cn('w-4 h-4', isRTL ? 'rotate-180' : '')} />
            {t('common.back', 'Back')}
          </button>

          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
            {heading}
          </span>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h1 dir="auto" className="text-xl md:text-2xl font-black text-slate-900 dark:text-white truncate unicode-bidi-plaintext">
                {serviceTitle}
              </h1>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300 font-semibold">
                {otherUser?.name || t('common.unknownSeller', 'Unknown seller')}
              </p>
            </div>
            <div className={cn('px-3 py-1 rounded-full text-xs font-bold', isClosed ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300' : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300')}>
              {isClosed ? t('status.closed', 'Closed') : t('status.active', 'Active')}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/10 dark:bg-indigo-500/10 border border-indigo-600/20 dark:border-indigo-500/20 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-black text-slate-900 dark:text-white">
                {t('orderMessages.conversation', 'Conversation')}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {t('services.inquiry.subtitle', 'Pre-order questions and answers')}
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
          {messages.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-14 h-14 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3">
                <MessageSquare className="w-7 h-7 text-slate-400 dark:text-slate-500" />
              </div>
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                {t('services.inquiry.empty', 'No messages yet. Start the conversation.')}
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const senderId = msg?.sender?.id ?? msg?.sender_id;
              const isOwn = senderId === user?.id;
              const senderName = msg?.sender?.name || 'User';
              const hasText = typeof msg?.message === 'string' && msg.message.trim().length > 0;
              const hasAttachment = Boolean(msg?.attachment_url);
              const isImage = hasAttachment && isImageMimeType(msg?.attachment_type);
              const previewUrl = isImage ? imagePreviews[String(msg.id)] : null;
              const sizeLabel = formatFileSize(msg?.attachment_size);
              return (
                <div key={msg.id} className={cn('flex items-end gap-3', isOwn ? 'justify-end' : 'justify-start')}>
                  {!isOwn ? <Avatar src={msg?.sender?.avatar_url} name={senderName} size={32} /> : null}
                  <div className={cn('max-w-[75%] min-w-0', isOwn ? 'items-end' : 'items-start')}>
                    <p className={cn('text-[11px] font-bold mb-1', isOwn ? 'text-slate-400 text-right' : 'text-slate-500 dark:text-slate-400')}>
                      {senderName}
                    </p>
                    <div
                      className={cn(
                        'rounded-3xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap break-words border',
                        isOwn
                          ? 'bg-gradient-to-r from-indigo-600 to-cyan-500 text-white border-transparent'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-700'
                      )}
                    >
                      {hasText ? (
                        <p dir="auto" className="unicode-bidi-plaintext">
                          {msg.message}
                        </p>
                      ) : null}
                      {hasAttachment ? (
                        <div className={cn(hasText ? 'mt-3' : '')}>
                          {isImage ? (
                            <div className="space-y-2">
                              <button
                                type="button"
                                onClick={() => openImageAttachment(msg)}
                                className={cn(
                                  'block w-full overflow-hidden rounded-2xl border',
                                  isOwn
                                    ? 'border-white/20 bg-white/10 hover:bg-white/15'
                                    : 'border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-900/40 hover:bg-white dark:hover:bg-slate-900/60'
                                )}
                              >
                                {previewUrl ? (
                                  <img
                                    src={previewUrl}
                                    alt={msg.attachment_name || t('conversation.attachment', 'Attachment')}
                                    className="w-full max-h-64 object-contain"
                                    loading="lazy"
                                  />
                                ) : (
                                  <div className="w-full h-40 flex items-center justify-center">
                                    <Image
                                      className={cn(
                                        'w-6 h-6',
                                        isOwn ? 'text-white/80' : 'text-slate-400 dark:text-slate-500'
                                      )}
                                    />
                                  </div>
                                )}
                              </button>
                              <div className="flex items-center justify-between gap-2">
                                <div className="min-w-0">
                                  <p
                                    dir="auto"
                                    className={cn(
                                      'text-xs font-semibold truncate',
                                      isOwn ? 'text-white/90' : 'text-slate-700 dark:text-slate-200'
                                    )}
                                  >
                                    {msg.attachment_name || t('conversation.attachment', 'Attachment')}
                                  </p>
                                  {sizeLabel ? (
                                    <p className={cn('text-[11px]', isOwn ? 'text-white/70' : 'text-slate-500 dark:text-slate-400')}>
                                      {sizeLabel}
                                    </p>
                                  ) : null}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => downloadAttachment(msg)}
                                  className={cn(
                                    'inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold border transition-colors',
                                    isOwn
                                      ? 'border-white/25 bg-white/10 hover:bg-white/15 text-white'
                                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
                                  )}
                                >
                                  <Download className="w-4 h-4" />
                                  {t('conversation.downloadAttachment', 'Download attachment')}
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div
                              className={cn(
                                'rounded-2xl border px-4 py-3 flex items-center justify-between gap-3',
                                isOwn
                                  ? 'border-white/20 bg-white/10'
                                  : 'border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-900/40'
                              )}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <FileText
                                  className={cn(
                                    'w-5 h-5 shrink-0',
                                    isOwn ? 'text-white/80' : 'text-slate-400 dark:text-slate-500'
                                  )}
                                />
                                <div className="min-w-0">
                                  <p
                                    dir="auto"
                                    className={cn(
                                      'text-xs font-semibold truncate',
                                      isOwn ? 'text-white/90' : 'text-slate-700 dark:text-slate-200'
                                    )}
                                  >
                                    {msg.attachment_name || t('conversation.attachment', 'Attachment')}
                                  </p>
                                  {sizeLabel ? (
                                    <p className={cn('text-[11px]', isOwn ? 'text-white/70' : 'text-slate-500 dark:text-slate-400')}>
                                      {sizeLabel}
                                    </p>
                                  ) : null}
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => downloadAttachment(msg)}
                                className={cn(
                                  'inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold border transition-colors shrink-0',
                                  isOwn
                                    ? 'border-white/25 bg-white/10 hover:bg-white/15 text-white'
                                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
                                )}
                              >
                                <Download className="w-4 h-4" />
                                {t('conversation.downloadAttachment', 'Download attachment')}
                              </button>
                            </div>
                          )}
                        </div>
                      ) : null}
                    </div>
                  </div>
                  {isOwn ? <Avatar src={msg?.sender?.avatar_url} name={senderName} size={32} /> : null}
                </div>
              );
            })
          )}
        </div>

        <form onSubmit={handleSend} className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-end gap-3">
            <textarea
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder={t('services.inquiry.writeQuestion', 'Write your question')}
              dir="auto"
              rows={2}
              maxLength={2000}
              disabled={sending || isClosed}
              className="flex-1 min-h-[72px] resize-none rounded-3xl border border-slate-200 dark:border-[#2E2F3A] bg-slate-100 dark:bg-[#40414F] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
            <div className="flex items-stretch gap-2">
              <button
                type="button"
                onClick={() => handlePickFile(isClosed)}
                disabled={sending || isClosed}
                aria-label={t('conversation.attachFile', 'Attach file')}
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-3 transition-all hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Paperclip className={cn('w-4 h-4', isRTL && 'rotate-180')} />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".jpg,.jpeg,.png,.webp,.gif,.pdf,.zip,.rar,.doc,.docx,.txt"
                onChange={handleFileChange}
              />
            <button
              type="submit"
              disabled={sending || isClosed || (!messageInput.trim() && !selectedFile)}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 text-white px-4 py-3 text-sm font-semibold transition-all hover:bg-indigo-500 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed min-w-[120px]"
            >
              {sending ? (
                <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              {t('services.inquiry.send', 'Send message')}
            </button>
            </div>
          </div>
          {selectedFile ? (
            <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate" dir="auto">
                  {t('conversation.selectedFile', 'Selected file')}: {selectedFile.name}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
              <button
                type="button"
                onClick={removeSelectedFile}
                className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline"
              >
                {t('conversation.removeFile', 'Remove file')}
              </button>
            </div>
          ) : null}
        </form>
      </div>
    </div>
  );
};

export default ServiceInquiryDetails;
