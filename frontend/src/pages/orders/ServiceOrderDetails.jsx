import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { getServiceOrderById, getOrderMessages, sendOrderMessage } from '../../api/serviceOrdersApi';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import ErrorState from '../../components/common/ErrorState';
import Avatar from '../../components/common/Avatar';
import OrderStatusBadge from '../../components/marketplace/OrderStatusBadge';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import { Send, ArrowLeft, MessageSquare, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '../../utils/cn';

const ServiceOrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, isRTL, dir } = useLanguage();

  const [order, setOrder] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [sending, setSending] = useState(false);
  
  const messagesEndRef = useRef(null);

  const fetchOrderAndMessages = async () => {
    setLoading(true);
    setError(null);
    try {
      // Parallel fetch if possible, but let's do sequential or Promise.all
      const [orderRes, msgsRes] = await Promise.all([
        getServiceOrderById(id),
        getOrderMessages(id)
      ]);

      // Handle order parsing safely
      const orderData = orderRes?.order || orderRes?.data || orderRes;
      setOrder(orderData);

      // Safe extraction as requested
      const messagesArray = Array.isArray(msgsRes)
        ? msgsRes
        : Array.isArray(msgsRes?.messages)
        ? msgsRes.messages
        : Array.isArray(msgsRes?.data)
        ? msgsRes.data
        : [];
      
      setMessages(messagesArray);
    } catch (err) {
      if (err.response?.status === 403) {
        setError(t('orderMessages.noPermission', 'You do not have permission to view this conversation.'));
      } else if (err.response?.status === 401) {
        navigate('/login');
      } else {
        setError(t('orderMessages.couldNotLoad', 'Could not load messages. Please try again.'));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderAndMessages();
  }, [id]);

  useEffect(() => {
    // Scroll to bottom when messages load or change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const trimmed = messageInput.trim();
    if (!trimmed) {
      toast.error(t('orderMessages.requireText', 'Please write a message first.'));
      return;
    }

    setSending(true);
    try {
      const res = await sendOrderMessage(id, trimmed);
      
      // Try to append the returned message or just refetch
      const newMsg = res?.orderMessage || res?.data || res?.messageObj;
      if (newMsg && typeof newMsg === 'object' && newMsg.id) {
        setMessages(prev => [...prev, newMsg]);
      } else {
        // Fallback: refetch messages
        const msgsRes = await getOrderMessages(id);
        const messagesArray = Array.isArray(msgsRes)
          ? msgsRes
          : Array.isArray(msgsRes?.messages)
          ? msgsRes.messages
          : Array.isArray(msgsRes?.data)
          ? msgsRes.data
          : [];
        setMessages(messagesArray);
      }
      
      setMessageInput('');
      toast.success(t('orderMessages.sentSuccessfully', 'Message sent successfully'));
    } catch (err) {
      toast.error(t('components.errorState.title', 'Something went wrong'));
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader />
        <p className="mt-4 text-slate-500 font-medium">
          {t('orderMessages.loading', 'Loading conversation...')}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto py-12">
        <ErrorState error={error} onRetry={fetchOrderAndMessages} />
      </div>
    );
  }

  if (!order) return null;

  const isSeller = order.seller_id === user?.id || order.service?.seller_id === user?.id;
  const isBuyer = order.buyer_id === user?.id;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(-1)} 
            className="rounded-full w-10 h-10 p-0 flex items-center justify-center"
          >
            <ArrowLeft className={cn("w-5 h-5", isRTL && "rotate-180")} />
          </Button>
          <div>
            <h1 className="text-2xl font-black text-slate-900 flex items-center gap-3">
              {t('orderMessages.conversation', 'Conversation')}
              <OrderStatusBadge status={order.status} />
            </h1>
            <p className="text-sm font-bold text-slate-500 mt-1 uppercase tracking-widest">
              {t('dashboard.buyerOrders.orderNumber', 'Order #{{id}}', { id: order.id })}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">{t('dashboard.buyer.serviceFallback', 'Service Order')}</h3>
            <div className="aspect-video bg-slate-100 rounded-xl overflow-hidden mb-4">
              <img 
                src={order.service?.image || `https://placehold.co/400x300/6366f1/ffffff?text=Service`} 
                alt="Service"
                className="w-full h-full object-cover"
              />
            </div>
            <h4 className="font-bold text-slate-800 mb-2">
              {order.service?.title}
            </h4>
            
            <div className="space-y-3 mt-6 border-t border-slate-100 pt-6">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">{t('dashboard.buyerOrders.sellerLabel', 'Seller')}</span>
                <span className="font-semibold text-slate-900">{order.service?.seller?.username || order.seller?.username || order.service?.seller?.name || 'Seller'}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">{t('dashboard.buyerOrders.price', 'Price')}</span>
                <span className="font-black text-indigo-600">{formatCurrency(order.amount || order.service?.price || 0)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">{t('dashboard.buyerOrders.date', 'Date')}</span>
                <span className="font-semibold text-slate-900">{formatDate(order.created_at)}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Messaging Area */}
        <div className="lg:col-span-2">
          <Card className="flex flex-col h-[600px] p-0 overflow-hidden border-slate-200 dark:border-slate-800 shadow-md">
            
            {/* Header */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/50 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">
                  {t('orderMessages.title', 'Messages')}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {isBuyer ? t('dashboard.seller.buyer', 'Buyer') : isSeller ? t('dashboard.buyerOrders.sellerLabel', 'Seller') : 'Admin'}
                </p>
              </div>
            </div>

            {/* Messages Thread */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30 dark:bg-slate-950/20">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                  <MessageSquare className="w-12 h-12 mb-3 opacity-20" />
                  <p className="font-medium text-slate-600 dark:text-slate-400">{t('orderMessages.noMessagesYet', 'No messages yet')}</p>
                  <p className="text-sm">{t('orderMessages.startConversation', 'Start the conversation about this order.')}</p>
                </div>
              ) : (
                messages.map((msg, index) => {
                  const isMine = msg.sender?.id === user?.id || msg.sender_id === user?.id;
                  
                  return (
                    <div 
                      key={msg.id || index} 
                      className={cn(
                        "flex gap-4 w-full max-w-[85%]",
                        isMine ? "ml-auto flex-row-reverse" : "mr-auto"
                      )}
                    >
                      <Avatar 
                        src={msg.sender?.avatar_url || msg.sender?.avatar} 
                        name={msg.sender?.name || msg.sender?.username || 'User'} 
                        size="sm" 
                        className="shrink-0 mt-1 shadow-sm"
                      />
                      <div className={cn(
                        "flex flex-col gap-1",
                        isMine ? "items-end" : "items-start"
                      )}>
                        <div className="flex items-baseline gap-2">
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            {msg.sender?.name || msg.sender?.username || 'User'}
                          </span>
                          <span className="text-[10px] font-medium text-slate-400">
                            {formatDate(msg.created_at)}
                          </span>
                        </div>
                        <div className={cn(
                          "px-4 py-3 rounded-2xl text-sm shadow-sm",
                          isMine 
                            ? "bg-indigo-600 text-white rounded-tr-sm" 
                            : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-700 rounded-tl-sm"
                        )}>
                          {/* User generated message text, DO NOT translate */}
                          <p className="whitespace-pre-wrap unicode-bidi-plaintext" dir="auto">
                            {msg.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800/50">
              <form onSubmit={handleSendMessage} className="flex items-end gap-3">
                <div className="flex-1">
                  <textarea
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                        handleSendMessage(e);
                      }
                    }}
                    placeholder={t('orderMessages.placeholder', 'Write a message about this order...')}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 resize-none transition-all"
                    rows={3}
                    maxLength={2000}
                    disabled={sending}
                  />
                  <div className="text-[10px] text-slate-400 mt-1 flex justify-between px-2">
                    <span>Ctrl + Enter {t('orderMessages.send', 'to Send')}</span>
                    <span>{messageInput.length}/2000</span>
                  </div>
                </div>
                <Button 
                  type="submit" 
                  disabled={sending || !messageInput.trim()} 
                  isLoading={sending}
                  className="mb-5 rounded-xl h-12 w-12 p-0 flex items-center justify-center shadow-lg"
                >
                  {!sending && <Send className={cn("w-5 h-5", isRTL && "rotate-180")} />}
                </Button>
              </form>
            </div>
            
          </Card>
        </div>
        
      </div>
    </div>
  );
};

export default ServiceOrderDetails;
