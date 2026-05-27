import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, ShoppingBag, ChevronRight, Zap, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import MediaThumbnail from '../../components/common/MediaThumbnail';
import { formatCurrency } from '../../utils/formatCurrency';
import { createCheckoutSession } from '../../api/productOrdersApi';
import { createServiceCheckoutSession } from '../../api/serviceOrdersApi';
import SEO from '../../components/common/SEO';

const Cart = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { cartItems, removeFromCart, cartTotal, clearCart } = useCart();
  const [checkingOut, setCheckingOut] = useState(null);
  const [ordering, setOrdering] = useState(null);

  const handleCheckoutItem = async (itemId, itemType = 'product') => {
    if (!isAuthenticated) {
      toast.error(t('pages.cart.authRequired', 'Please sign in to continue checkout'));
      navigate('/login', { state: { from: { pathname: '/cart' } } });
      return;
    }

    // Handle service checkout - ALWAYS use Stripe
    if (itemType === 'service') {
      await handleServiceCheckout(itemId);
      return;
    }

    // Handle product checkout
    setCheckingOut(itemId);
    try {
      const data = await createCheckoutSession(itemId);
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        toast.error(t('pages.cart.checkoutError', 'Failed to create checkout session'));
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message || t('pages.cart.checkoutFailed', 'Checkout failed. Please try again.')
      );
    } finally {
      setCheckingOut(null);
    }
  };

  const handleServiceCheckout = async (serviceId) => {
    if (!isAuthenticated) {
      toast.error(t('pages.cart.authRequired', 'Please sign in to continue'));
      navigate('/login', { state: { from: { pathname: '/cart' } } });
      return;
    }

    setCheckingOut(serviceId);
    try {
      const data = await createServiceCheckoutSession(serviceId);
      if (data.checkout_url) {
        // Remove from cart before redirecting to Stripe
        removeFromCart(`service-${serviceId}`);
        // Redirect to Stripe Checkout
        window.location.href = data.checkout_url;
      } else {
        toast.error(t('pages.cart.checkoutServiceFailed', 'Could not start service checkout. Please try again.'));
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message || t('pages.cart.checkoutServiceFailed', 'Could not start service checkout. Please try again.')
      );
    } finally {
      setCheckingOut(null);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="bg-transparent min-h-screen pb-20 mt-12">
        <SEO
          title={t('pages.cart.seoTitle', 'Shopping Cart - Lernnova')}
          description={t('pages.cart.seoDesc', 'Your shopping cart is empty. Browse our digital marketplace and add premium products.')}
        />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
          <div className="text-center space-y-8">
            <div className="flex justify-center">
              <div className="w-24 h-24 bg-slate-50 dark:bg-slate-900/60 rounded-full flex items-center justify-center border border-slate-200 dark:border-slate-800">
                <ShoppingBag className="w-12 h-12 text-slate-400 dark:text-slate-500" />
              </div>
            </div>

            <div className="space-y-4">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                {t('pages.cart.emptyTitle', 'Your Cart is Empty')}
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-300 font-medium">
                {t('pages.cart.emptySubtitle', 'Explore our digital products and add something useful to your cart.')}
              </p>
            </div>

            <Link to="/products">
              <Button size="lg">
                {t('pages.cart.browseCTA', 'Browse Marketplace')}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const getCartItemImage = (item) => {
    const raw = item?.raw || item;
    const firstImage = Array.isArray(raw?.images) ? raw.images[0] : null;
    const serviceImage =
      (typeof firstImage === 'string' ? firstImage : null) ||
      firstImage?.url ||
      firstImage?.image_url ||
      firstImage?.path ||
      null;

    if (item?.type === 'service') {
      return (
        item.thumbnail ||
        item.thumbnail_url ||
        serviceImage ||
        raw?.thumbnail_url ||
        raw?.thumbnail ||
        raw?.image ||
        raw?.image_url ||
        raw?.cover ||
        null
      );
    }

    return (
      item.thumbnail ||
      item.thumbnail_url ||
      raw?.thumbnail_url ||
      raw?.thumbnail ||
      raw?.image_url ||
      raw?.image ||
      raw?.cover ||
      null
    );
  };

  const isSingleItem = cartItems.length === 1;

  return (
    <div className="bg-transparent min-h-screen pb-20 mt-12">
      <SEO
        title={t('pages.cart.seoTitle', 'Shopping Cart - Lernnova')}
        description={t('pages.cart.seoDesc', 'Your shopping cart. Review and checkout your digital products.')}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <nav className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-8 uppercase tracking-widest">
          <Link to="/" className="hover:text-slate-900 dark:hover:text-white transition-colors">
            {t('nav.home')}
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-emerald-600">{t('pages.cart.title', 'Your Cart')}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                {t('pages.cart.title', 'Your Cart')}
              </h1>
              <span className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full text-sm font-bold">
                {cartItems.length} {cartItems.length === 1 ? t('pages.cart.itemSingular', 'item') : t('pages.cart.itemPlural', 'items')}
              </span>
            </div>

            {!isSingleItem && (
              <div className="bg-amber-50/50 dark:bg-amber-900/20 border border-amber-200/50 dark:border-amber-800/30 rounded-2xl p-5">
                <p className="text-sm font-bold text-amber-900 dark:text-amber-200">
                  {t('pages.cart.multiProductNotice', 'Multi-product checkout is coming soon. Please checkout one product at a time.')}
                </p>
              </div>
            )}

            <div className="space-y-4">
              {cartItems.map((item) => (
                <Card key={item.cartKey || item.id} className="flex gap-6 p-6 group">
                  {/* Item Image */}
                  <div className="w-24 h-24 flex-shrink-0 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 overflow-hidden">
                    <MediaThumbnail
                      type={item.type === 'service' ? 'service' : 'product'}
                      src={getCartItemImage(item)}
                      alt={item.title}
                      fit="cover"
                    />
                  </div>

                  {/* Item Info */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white line-clamp-2 group-hover:text-emerald-600 transition-colors">
                          {item.title}
                        </h3>
                        <Badge variant={item.type === 'service' ? 'secondary' : 'primary'} className="flex-shrink-0">
                          {item.type === 'service' ? 'Service' : 'Product'}
                        </Badge>
                      </div>
                      {item.short_description && (
                        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-1 mb-2">
                          {item.short_description}
                        </p>
                      )}
                      {item.category && (
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                          {typeof item.category === 'object' ? item.category.name : item.category}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className="text-xl font-black text-slate-900 dark:text-white">
                          {formatCurrency(item.price)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant={item.type === 'service' ? 'default' : 'primary'}
                          icon={item.type === 'service' ? Clock : Zap}
                          onClick={() => handleCheckoutItem(item.id, item.type)}
                          isLoading={checkingOut === item.id || ordering === item.id}
                        >
                          {item.type === 'service' ? t('pages.cart.orderService', 'Order') : t('pages.cart.checkout', 'Checkout')}
                        </Button>

                        <button
                          onClick={() => {
                            removeFromCart(item.cartKey || item.id);
                            toast.success(t('pages.cart.itemRemoved', 'Item removed from cart'));
                          }}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                          title={t('pages.cart.remove', 'Remove')}
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {cartItems.length > 0 && (
              <div className="flex items-center gap-3 pt-4">
                <button
                  onClick={() => {
                    clearCart();
                    toast.success(t('pages.cart.cartCleared', 'Cart cleared'));
                  }}
                  className="text-sm font-bold text-slate-500 hover:text-rose-600 transition-colors"
                >
                  {t('pages.cart.clearCart', 'Clear Cart')}
                </button>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-32 space-y-6">
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                {t('pages.cart.orderSummary', 'Order Summary')}
              </h2>

              {isSingleItem ? (
                <>
                  <div className="space-y-4 pb-6 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 dark:text-slate-400 font-medium">
                        {t('pages.cart.subtotal', 'Subtotal')}
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {formatCurrency(cartTotal)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-black text-slate-900 dark:text-white">
                        {t('pages.cart.total', 'Total')}
                      </span>
                      <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(cartTotal)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      {t('pages.cart.secureCheckout', 'Secure checkout powered by Stripe')}
                    </p>
                  </div>

                  <Button
                    className="w-full py-3.5"
                    size="lg"
                    onClick={() => handleCheckoutItem(cartItems[0].id, cartItems[0].type || 'product')}
                    isLoading={checkingOut === cartItems[0].id || ordering === cartItems[0].id}
                  >
                    {(cartItems[0].type || 'product') === 'service' 
                      ? t('pages.cart.proceedOrder', 'Proceed with Order')
                      : t('pages.cart.proceedCheckout', 'Proceed to Checkout')}
                  </Button>

                  <Link to="/products" className="block">
                    <Button variant="outline" className="w-full py-3.5">
                      {t('pages.cart.continueShopping', 'Continue Shopping')}
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <div className="space-y-3 pb-6 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 dark:text-slate-400 font-medium">
                        {t('pages.cart.total', 'Total')}
                      </span>
                      <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(cartTotal)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {cartItems.map((item) => (
                      <button
                        key={`${item.type || 'product'}-${item.id}`}
                        onClick={() => handleCheckoutItem(item.id, item.type || 'product')}
                        disabled={checkingOut !== null}
                        className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold rounded-xl transition-colors disabled:opacity-50 disabled:pointer-events-none text-sm"
                      >
                        {checkingOut === item.id ? t('pages.cart.checking', 'Processing...') : t('pages.cart.checkoutThis', 'Checkout') + ': ' + item.title.substring(0, 30)}
                      </button>
                    ))}
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium text-center">
                    {t('pages.cart.checkoutOneAtTime', 'Choose a product above to checkout')}
                  </p>

                  <Link to="/products" className="block">
                    <Button variant="outline" className="w-full py-3.5">
                      {t('pages.cart.continueShopping', 'Continue Shopping')}
                    </Button>
                  </Link>
                </>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
