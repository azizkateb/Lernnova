import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  getServiceOrderById,
  getOrderMessages,
  sendOrderMessage,
  downloadOrderMessageAttachment,
} from '../../api/serviceOrdersApi';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import OrderStatusBadge from '../../components/marketplace/OrderStatusBadge';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import { downloadBlob } from '../../utils/downloadHelper';
import { API_URL } from '../../utils/constants';
import {
  Send,
  ArrowLeft,
  MessageSquare,
  AlertCircle,
  Lock,
  ShieldCheck,
  Briefcase,
  Paperclip,
  Download,
  FileText,
  Image,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '../../utils/cn';

const extractOrder = (res) =>
  res?.order || res?.serviceOrder || res?.data?.order || res?.data || res;

const extractMessages = (res) => {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.messages)) return res.messages;
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.data?.messages)) return res.data.messages;
  return [];
};

// Resolve a relative or absolute backend asset path into a full URL.
// Avatar paths are stored as `uploads/avatars/<file>` and served by
// express.static at `/uploads/avatars`. The base URL must NOT include /api.
const getFileUrl = (path) => {
  if (!path || typeof path !== 'string') return null;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  if (path.startsWith('data:') || path.startsWith('blob:')) return path;
  const rawBase = String(API_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000');
  // Strip trailing slashes AND a trailing /api segment if someone misconfigured it,
  // so we never produce `/api/uploads/...`.
  const base = rawBase.replace(/\/+$/, '').replace(/\/api$/, '');
  const cleanPath = path.replace(/^\/+/, '');
  return `${base}/${cleanPath}`;
};

const getInitials = (name) => {
  if (!name || typeof name !== 'string') return 'U';
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w?.[0] || '')
      .join('')
      .toUpperCase() || 'U'
  );
};

const resolveAvatarPath = (user) =>
  user?.avatar_url ||
  user?.avatar ||
  user?.image ||
  user?.profile_image ||
  user?.profile_picture ||
  user?.photo ||
  null;

const UserAvatar = ({ user, size = 'md', className = '' }) => {
  const avatarPath = resolveAvatarPath(user);
  const avatarUrl = getFileUrl(avatarPath);
  // Reset error state whenever the resolved avatar URL changes so a previous
  // failure doesn't permanently hide a newly-resolved real image.
  const [imgError, setImgError] = useState(false);
  useEffect(() => {
    setImgError(false);
  }, [avatarUrl]);

  const initials = getInitials(user?.name || user?.username || user?.full_name);
  const sizeClass =
    size === 'sm'
      ? 'w-8 h-8 text-[11px]'
      : size === 'lg'
      ? 'w-12 h-12 text-base'
      : 'w-10 h-10 text-sm';

  if (avatarUrl && !imgError) {
    return (
      <img
        src={avatarUrl}
        alt={user?.name || user?.username || 'User'}
        onError={() => setImgError(true)}
        loading="lazy"
        className={cn(
          sizeClass,
          'rounded-full object-cover border-2 border-white dark:border-slate-700 shadow-sm flex-shrink-0 bg-slate-100 dark:bg-slate-800',
          className
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        sizeClass,
        'rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold flex-shrink-0 shadow-sm border-2 border-white dark:border-slate-700',
        className
      )}
      aria-label={user?.name || user?.username || 'User'}
    >
      {initials}
    </div>
  );
};

const AnimatedSendButton = ({ children, disabled, loading, animating, type = 'submit', className }) => {
  const { t } = useLanguage();
  const label = loading ? t('common.sending', 'Sending...') : t('common.send', 'Send');

  return (
    <button
      type={type}
      disabled={disabled || loading || animating}
      aria-label={label}
      className={cn(
        'animated-send-button self-end inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white px-4 py-3 text-sm font-semibold overflow-hidden transition-all duration-200 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed',
        animating && 'is-animating',
        className
      )}
    >
      <span className="animated-send-button__svg-wrapper inline-flex items-center justify-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="20"
          height="20"
          aria-hidden="true"
          className="text-white transition-transform duration-300"
        >
          <path fill="none" d="M0 0h24v24H0z" />
          <path
            fill="currentColor"
            d="M1.946 9.315c-.522-.174-.527-.455.01-.634l19.087-6.362c.529-.176.832.12.684.638l-5.454 19.086c-.15.529-.455.547-.679.045L12 14l6-8-8 6-8.054-2.685z"
          />
        </svg>
      </span>
      <span className="animated-send-button__label whitespace-nowrap">
        {children ?? label}
      </span>
    </button>
  );
};

const formatTime = (value) => {
  if (!value) return '';
  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
};

const statusColor = (status) => {
  switch ((status || '').toLowerCase()) {
    case 'completed':
      return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
    case 'in_progress':
      return 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400';
    case 'delivered':
      return 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400';
    case 'pending':
      return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
    case 'cancelled':
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    default:
      return 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300';
  }
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

const ServiceOrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, isRTL } = useLanguage();

  const [order, setOrder] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [errorStatus, setErrorStatus] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [sending, setSending] = useState(false);
  const [isSendAnimating, setIsSendAnimating] = useState(false);
  const [readOnly, setReadOnly] = useState(false);
  const [imagePreviews, setImagePreviews] = useState({});

  const messagesContainerRef = useRef(null);
  const shouldScrollMessagesRef = useRef(false);
  const fileInputRef = useRef(null);
  const imagePreviewsRef = useRef({});

  const fetchOrderAndMessages = async () => {
    setLoading(true);
    setError(null);
    setErrorStatus(null);
    try {
      const orderRes = await getServiceOrderById(id);
      const orderData = extractOrder(orderRes);
      setOrder(orderData);

      // Backend returns the order with messages embedded; still fetch /messages for freshness
      try {
        const msgsRes = await getOrderMessages(id);
        const messagesArray = extractMessages(msgsRes);
        setMessages(messagesArray);
      } catch (msgErr) {
        // If messages endpoint fails, fall back to embedded messages from order payload
        if (Array.isArray(orderData?.messages)) {
          setMessages(orderData.messages);
        } else {
          setMessages([]);
        }
      }
    } catch (err) {
      const status = err?.response?.status;
      setErrorStatus(status || null);
      if (status === 404) {
        setError(t('orderMessages.orderNotFound', 'Service order not found.'));
      } else if (status === 403) {
        setError(
          t(
            'orderMessages.noPermissionOrder',
            'You do not have permission to view this service order.'
          )
        );
      } else if (status === 401) {
        navigate('/login');
        return;
      } else {
        setError(
          t('orderMessages.couldNotLoad', 'Could not load messages. Please try again.')
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderAndMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (!shouldScrollMessagesRef.current) return;
    shouldScrollMessagesRef.current = false;

    const container = messagesContainerRef.current;
    if (!container) return;

    container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
  }, [messages]);

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
          const blob = await downloadOrderMessageAttachment(id, msg.id);
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

  const sendMessage = async (text, file) => {
    setSending(true);
    try {
      const res = await sendOrderMessage(id, text, file);
      const newMsg =
        res?.orderMessage || res?.messageObj || res?.data?.orderMessage || res?.data;

      if (newMsg && typeof newMsg === 'object' && newMsg.id) {
        shouldScrollMessagesRef.current = true;
        setMessages((prev) => [...prev, newMsg]);
      } else {
        shouldScrollMessagesRef.current = true;
        try {
          const msgsRes = await getOrderMessages(id);
          setMessages(extractMessages(msgsRes));
        } catch {
        }
      }

      setMessageInput('');
      setSelectedFile(null);
      toast.success(t('orderMessages.sentSuccessfully', 'Message sent successfully'));
    } catch (err) {
      const status = err?.response?.status;
      if (status === 403) {
        setReadOnly(true);
        toast.error(
          t(
            'orderMessages.cannotSend',
            'You do not have permission to send messages on this order.'
          )
        );
      } else if (status === 401) {
        navigate('/login');
      } else {
        toast.error(
          err?.response?.data?.message ||
            t('components.errorState.title', 'Something went wrong')
        );
      }
    } finally {
      setSending(false);
    }
  };

  const handlePickFile = () => {
    if (sending || isSendAnimating || readOnly) return;
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
      const blob = await downloadOrderMessageAttachment(id, msg.id);
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
      const blob = await downloadOrderMessageAttachment(id, msg.id);
      const nextUrl = URL.createObjectURL(blob);
      setImagePreviews((prev) => ({ ...prev, [key]: nextUrl }));
      window.open(nextUrl, '_blank', 'noopener,noreferrer');
    } catch (err) {
      toast.error(err?.response?.data?.message || t('components.errorState.title', 'Something went wrong'));
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const trimmed = messageInput.trim();
    if (!trimmed && !selectedFile) {
      toast.error(t('orderMessages.requireText', 'Please write a message or attach a file.'));
      return;
    }

    if (sending || isSendAnimating) return;

    setIsSendAnimating(true);
    await new Promise((resolve) => setTimeout(resolve, 650));
    setIsSendAnimating(false);

    await sendMessage(trimmed, selectedFile);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader />
        <p className="mt-4 text-slate-500 dark:text-slate-400 font-medium">
          {t('orderMessages.loading', 'Loading conversation...')}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            <ArrowLeft className={cn('w-4 h-4', isRTL && 'rotate-180')} />
            <span>{t('common.back', 'Back')}</span>
          </button>
        </div>
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-8 text-center shadow-sm">
          <div className="w-14 h-14 mx-auto rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center mb-4">
            <AlertCircle className="w-7 h-7 text-rose-600 dark:text-rose-400" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            {errorStatus === 404
              ? t('orderMessages.orderNotFound', 'Service order not found.')
              : errorStatus === 403
              ? t(
                  'orderMessages.noPermissionOrder',
                  'You do not have permission to view this service order.'
                )
              : t('components.errorState.title', 'Something went wrong')}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{error}</p>
          <div className="flex items-center justify-center gap-3">
            {errorStatus !== 404 && errorStatus !== 403 && (
              <Button onClick={fetchOrderAndMessages}>
                {t('components.errorState.retry', 'Retry')}
              </Button>
            )}
            <Link
              to={user?.role === 'admin' ? '/admin/service-orders' : '/dashboard'}
              className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              {t('common.back', 'Back')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!order) return null;

  const isAdmin = user?.role === 'admin';
  const isSeller =
    !isAdmin &&
    (order.seller_id === user?.id ||
      order.seller?.id === user?.id ||
      order.service?.seller_id === user?.id);
  const isBuyer = !isAdmin && (order.buyer_id === user?.id || order.buyer?.id === user?.id);
  const viewerLabel = isAdmin
    ? t('orderMessages.adminLabel', 'Admin')
    : isBuyer
    ? t('dashboard.seller.buyer', 'Buyer')
    : isSeller
    ? t('dashboard.buyerOrders.sellerLabel', 'Seller')
    : '';

  const buyerName = order.buyer?.name || order.buyer?.username || '—';
  const sellerName =
    order.seller?.name ||
    order.seller?.username ||
    order.service?.seller?.name ||
    order.service?.seller?.username ||
    '—';
  const price = order.price ?? order.amount ?? order.service?.price ?? 0;
  const serviceThumb = getFileUrl(order.service?.thumbnail_url || order.service?.image);

  const getRoleBadge = (sender) => {
    if (!sender) return '';
    const sid = sender.id;
    if ((sender.role || '').toLowerCase() === 'admin')
      return t('orderMessages.adminLabel', 'Admin');
    if (sid != null && (sid === order.buyer_id || sid === order.buyer?.id))
      return t('dashboard.seller.buyer', 'Buyer');
    if (
      sid != null &&
      (sid === order.seller_id ||
        sid === order.seller?.id ||
        sid === order.service?.seller_id)
    )
      return t('dashboard.buyerOrders.sellerLabel', 'Seller');
    const r = (sender.role || '').toLowerCase();
    if (r === 'seller') return t('dashboard.buyerOrders.sellerLabel', 'Seller');
    if (r === 'buyer') return t('dashboard.seller.buyer', 'Buyer');
    return sender.role || '';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
      {/* Header */}
      <div className="mb-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          <ArrowLeft className={cn('w-4 h-4', isRTL && 'rotate-180')} />
          <span>{t('common.back', 'Back')}</span>
        </button>

        <div className="flex items-center gap-3 mt-3 flex-wrap">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
            {t('orderMessages.conversation', 'Order Conversation')}
          </h1>
          <span className="font-mono text-slate-400 dark:text-slate-500 text-sm md:text-base">
            #{order.id || id}
          </span>
          <span
            className={cn(
              'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold capitalize',
              statusColor(order.status)
            )}
          >
            {(order.status || '').replace(/_/g, ' ')}
          </span>
          {isAdmin && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              {t('orderMessages.adminView', 'Admin view')}
            </span>
          )}
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
          {t(
            'orderMessages.subtitle',
            'Review messages and order details.'
          )}
          {viewerLabel && (
            <>
              <span className="mx-2">·</span>
              <span>
                {t('orderMessages.viewingAs', 'Viewing as')}: {viewerLabel}
              </span>
            </>
          )}
        </p>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversation panel */}
        <div className="lg:col-span-2">
          <div className="lern-chat-container rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden flex flex-col">
            <div className="lern-chat-header px-5 py-4 bg-slate-50 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {t('orderMessages.chatTitle', 'Chat')}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 truncate" dir="auto">
                  <span dir="auto">{buyerName}</span>
                  <span className="mx-2">↔</span>
                  <span dir="auto">{sellerName}</span>
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 text-[11px] font-semibold px-3 py-1">
                  #{order.id || id}
                </span>
                {isAdmin && (
                  <span className="inline-flex items-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 text-[11px] font-semibold px-3 py-1">
                    {t('orderMessages.adminView', 'Admin view')}
                  </span>
                )}
              </div>
            </div>

            <div
              ref={messagesContainerRef}
              className="lern-chat-messages flex-1 min-h-[320px] max-h-[520px] overflow-y-auto px-4 py-5 bg-slate-50 dark:bg-slate-950/40"
            >
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <div className="w-14 h-14 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
                    <MessageSquare className="w-7 h-7 text-slate-400 dark:text-slate-500" />
                  </div>
                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                    {t('orderMessages.noMessagesYet', 'No messages yet')}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                    {t(
                      'orderMessages.startConversation',
                      'Start the conversation about this order.'
                    )}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg, index) => {
                    const senderId = msg.sender?.id ?? msg.sender_id;
                    const isOwn = senderId === user?.id;
                    const senderName = msg.sender?.name || msg.sender?.username || 'User';
                    const roleLabel = getRoleBadge(msg.sender);
                    const hasText = typeof msg.message === 'string' && msg.message.trim().length > 0;
                    const hasAttachment = Boolean(msg?.attachment_url);
                    const isImage = hasAttachment && isImageMimeType(msg?.attachment_type);
                    const previewUrl = isImage ? imagePreviews[String(msg.id)] : null;
                    const sizeLabel = formatFileSize(msg?.attachment_size);

                    return (
                      <div
                        key={msg.id || index}
                        className={cn(
                          'lern-chat-message flex items-end gap-3',
                          isOwn ? 'justify-end' : 'justify-start'
                        )}
                      >
                        {!isOwn && <UserAvatar user={msg.sender} size="sm" />}
                        <div className={cn('max-w-[70%] min-w-0', isOwn ? 'items-end' : 'items-start')}>
                          <div className={cn('flex flex-wrap items-center gap-2 mb-2', isOwn ? 'justify-end' : 'justify-start')}>
                            <span
                              className={cn(
                                'text-xs font-semibold truncate max-w-[160px]',
                                isOwn ? 'text-slate-100/80' : 'text-slate-700 dark:text-slate-300'
                              )}
                              dir="auto"
                            >
                              {senderName}
                            </span>
                            {roleLabel && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                                {roleLabel}
                              </span>
                            )}
                            <span className="text-[11px] text-slate-400 dark:text-slate-500">
                              {formatTime(msg.created_at)}
                            </span>
                          </div>
                          <div
                            className={cn(
                              'rounded-3xl p-4 text-sm leading-relaxed whitespace-pre-wrap break-words shadow-sm',
                              isOwn
                                ? 'bg-gradient-to-r from-indigo-600 to-cyan-500 text-white'
                                : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700'
                            )}
                          >
                            {hasText && <p dir="auto">{msg.message}</p>}
                            {hasAttachment && (
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
                                          : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 hover:bg-slate-100 dark:hover:bg-slate-900/60'
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
                                        {sizeLabel && (
                                          <p className={cn('text-[11px]', isOwn ? 'text-white/70' : 'text-slate-500 dark:text-slate-400')}>
                                            {sizeLabel}
                                          </p>
                                        )}
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => downloadAttachment(msg)}
                                        className={cn(
                                          'inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold border transition-colors',
                                          isOwn
                                            ? 'border-white/25 bg-white/10 hover:bg-white/15 text-white'
                                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
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
                                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40'
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
                                        {sizeLabel && (
                                          <p className={cn('text-[11px]', isOwn ? 'text-white/70' : 'text-slate-500 dark:text-slate-400')}>
                                            {sizeLabel}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => downloadAttachment(msg)}
                                      className={cn(
                                        'inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold border transition-colors shrink-0',
                                        isOwn
                                          ? 'border-white/25 bg-white/10 hover:bg-white/15 text-white'
                                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
                                      )}
                                    >
                                      <Download className="w-4 h-4" />
                                      {t('conversation.downloadAttachment', 'Download attachment')}
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        {isOwn && <UserAvatar user={msg.sender} size="sm" />}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {readOnly ? (
              <div className="px-4 py-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                <div className="flex items-center gap-3 rounded-2xl border border-amber-200 dark:border-amber-900/40 bg-amber-50 dark:bg-amber-900/20 px-4 py-3 text-amber-800 dark:text-amber-200">
                  <Lock className="w-4 h-4 shrink-0" />
                  <p className="text-xs font-semibold">
                    {t(
                      'orderMessages.readOnlyNote',
                      'Read-only: you do not have permission to send messages on this order.'
                    )}
                  </p>
                </div>
              </div>
            ) : (
              <form
                onSubmit={handleSendMessage}
                className="lern-chat-sender px-4 py-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              >
                <div className="flex flex-col sm:flex-row items-end gap-3">
                  <textarea
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                        handleSendMessage(e);
                      }
                    }}
                    placeholder={t(
                      'orderMessages.placeholder',
                      'Write a message about this order...'
                    )}
                    dir="auto"
                    rows={2}
                    maxLength={2000}
                    disabled={sending || isSendAnimating}
                    className="lern-chat-input flex-1 min-h-[84px] resize-none rounded-3xl border border-slate-200 dark:border-[#2E2F3A] bg-slate-100 dark:bg-[#40414F] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                  <div className="flex items-stretch gap-2 self-stretch">
                    <button
                      type="button"
                      onClick={handlePickFile}
                      disabled={sending || isSendAnimating}
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
                    <AnimatedSendButton
                      type="submit"
                      disabled={!messageInput.trim() && !selectedFile}
                      loading={sending}
                      animating={isSendAnimating}
                      className="min-w-[120px] self-stretch"
                    >
                      {sending ? t('common.sending', 'Sending...') : t('common.send', 'Send')}
                    </AnimatedSendButton>
                  </div>
                </div>
                {selectedFile && (
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
                )}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-2 mt-3 text-[11px] text-slate-500 dark:text-slate-400">
                  <span>{t('orderMessages.sendShortcut', 'Ctrl + Enter to send')}</span>
                  <span>{messageInput.length}/2000</span>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Order details */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">
              {t('orderMessages.orderDetails', 'Order Details')}
            </h3>

            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              {serviceThumb ? (
                <img
                  src={serviceThumb}
                  alt={order.service?.title || 'Service'}
                  className="w-12 h-12 rounded-xl object-cover flex-shrink-0 border border-slate-200 dark:border-slate-700"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Briefcase className="w-5 h-5 text-white" />
                </div>
              )}
              <div className="min-w-0">
                <p
                  dir="auto"
                  className="text-sm font-semibold text-slate-900 dark:text-white truncate"
                  title={order.service?.title || ''}
                >
                  {order.service?.title || '—'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t('dashboard.buyer.serviceFallback', 'Service Order')}
                </p>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400">
                  {t('dashboard.buyerOrders.status', 'Status')}
                </span>
                <OrderStatusBadge status={order.status} />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400">
                  {t('dashboard.buyerOrders.price', 'Price')}
                </span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {formatCurrency(price)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400">
                  {t('dashboard.buyerOrders.date', 'Created')}
                </span>
                <span className="text-slate-700 dark:text-slate-300">
                  {formatDate(order.created_at)}
                </span>
              </div>
              {order.delivery_deadline && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 dark:text-slate-400">
                    {t('orderMessages.deliveryDeadline', 'Deadline')}
                  </span>
                  <span className="text-slate-700 dark:text-slate-300">
                    {formatDate(order.delivery_deadline)}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400">
                  {t('dashboard.buyerOrders.orderId', 'Order ID')}
                </span>
                <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
                  #{order.id || id}
                </span>
              </div>
            </div>
          </div>

          {/* Buyer card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-5">
            <h3 className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
              {t('dashboard.seller.buyer', 'Buyer')}
            </h3>
            <div className="flex items-center gap-3">
              <UserAvatar user={order.buyer} size="md" />
              <div className="min-w-0">
                <p
                  dir="auto"
                  className="text-sm font-semibold text-slate-900 dark:text-white truncate"
                  title={buyerName}
                >
                  {buyerName}
                </p>
                {order.buyer?.email && (
                  <p
                    className="text-xs text-slate-500 dark:text-slate-400 truncate"
                    title={order.buyer.email}
                  >
                    {order.buyer.email}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Seller card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-5">
            <h3 className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
              {t('dashboard.buyerOrders.sellerLabel', 'Seller')}
            </h3>
            <div className="flex items-center gap-3">
              <UserAvatar
                user={order.seller || order.service?.seller}
                size="md"
              />
              <div className="min-w-0">
                <p
                  dir="auto"
                  className="text-sm font-semibold text-slate-900 dark:text-white truncate"
                  title={sellerName}
                >
                  {sellerName}
                </p>
                {(order.seller?.email || order.service?.seller?.email) && (
                  <p
                    className="text-xs text-slate-500 dark:text-slate-400 truncate"
                    title={order.seller?.email || order.service?.seller?.email}
                  >
                    {order.seller?.email || order.service?.seller?.email}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceOrderDetails;
