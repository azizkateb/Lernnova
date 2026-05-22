import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { getServiceInquiries } from '../../api/serviceInquiriesApi';
import Loader from '../../components/common/Loader';
import ErrorState from '../../components/common/ErrorState';
import Avatar from '../../components/common/Avatar';

const ServiceInquiries = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inquiries, setInquiries] = useState([]);

  const role = useMemo(() => {
    if (user?.role === 'admin') return null;
    return user?.role === 'seller' ? 'seller' : 'buyer';
  }, [user]);

  const fetchInquiries = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getServiceInquiries({ page: 1, limit: 50, ...(role ? { role } : {}) });
      setInquiries(Array.isArray(res?.inquiries) ? res.inquiries : []);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to load inquiries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, [role]);

  if (loading) return <Loader fullPage />;
  if (error) return <ErrorState error={error} />;

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
              {t('sidebar.serviceInquiries', 'Service Inquiries')}
            </h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300 font-semibold">
              {t('services.inquiry.subtitle', 'Pre-order questions and answers')}
            </p>
          </div>
          <div className="w-11 h-11 rounded-3xl bg-indigo-600/10 dark:bg-indigo-500/10 border border-indigo-600/20 dark:border-indigo-500/20 flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
        </div>
      </div>

      {inquiries.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-10 text-center">
          <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
            <Search className="w-7 h-7 text-slate-400 dark:text-slate-500" />
          </div>
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
            {t('services.inquiry.emptyList', 'No inquiries yet.')}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {inquiries.map((inq) => {
            const other = user?.id === inq?.buyer?.id ? inq?.seller : inq?.buyer;
            const lastMessage = Array.isArray(inq?.messages) && inq.messages[0] ? inq.messages[0] : null;
            return (
              <Link
                key={inq.id}
                to={`/service-inquiries/${inq.id}`}
                className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <Avatar src={other?.avatar_url} name={other?.name || 'User'} size={40} />
                    <div className="min-w-0">
                      <p dir="auto" className="text-sm font-black text-slate-900 dark:text-white truncate unicode-bidi-plaintext">
                        {inq?.service?.title || t('common.digitalService', 'Digital Service')}
                      </p>
                      <p className="mt-0.5 text-xs font-bold text-slate-500 dark:text-slate-400 truncate">
                        {other?.name || t('common.unknownSeller', 'Unknown seller')}
                      </p>
                      {lastMessage?.message ? (
                        <p dir="auto" className="mt-2 text-sm text-slate-600 dark:text-slate-300 line-clamp-2 unicode-bidi-plaintext">
                          {lastMessage.message}
                        </p>
                      ) : (
                        <p className="mt-2 text-sm text-slate-400 dark:text-slate-500">
                          {t('services.inquiry.empty', 'No messages yet. Start the conversation.')}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="shrink-0 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                    {String(inq?.status || 'open')}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ServiceInquiries;

