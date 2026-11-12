// ============================================================================
// ISML COLLEGE LMS — ENTERPRISE RAZORPAY CHECKOUT CLIENT (15+ Yrs Standards)
// Features: Dynamic Script Ingestion, Cryptographic Verification, 
// Failure & Abandonment Telemetry, 0ms Drop Rate Protection
// ============================================================================

export interface RazorpayPaymentOptions {
  amount: number; // in INR
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentPhone?: string;
  studentFeeLedgerId?: string;
  paymentFor: string;
  onSuccess: (receipt: {
    receiptNo: string;
    transactionRef: string;
    paymentId: string;
    orderId: string;
    amountPaid: number;
  }) => void;
  onFailure: (error: { code: string; description: string; step?: string }) => void;
  onDismiss?: () => void;
}

// Ensure Razorpay SDK script is loaded reliably once in window
export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(false);
    if ((window as any).Razorpay) return resolve(true);

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export async function initiateRazorpayPayment(options: RazorpayPaymentOptions): Promise<void> {
  try {
    const isLoaded = await loadRazorpayScript();
    if (!isLoaded) {
      options.onFailure({
        code: 'SDK_LOAD_FAILED',
        description: 'Unable to load secure Razorpay gateway. Please check your internet connection.',
      });
      return;
    }

    // 1. Create Server-Side Order ID
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://ismllms-production.up.railway.app';
    const orderRes = await fetch(`${backendUrl}/api/portals/finance/razorpay/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: options.amount,
        currency: 'INR',
        receipt: `RCP_${options.studentId.slice(0, 8)}_${Date.now().toString().slice(-4)}`,
        notes: {
          studentId: options.studentId,
          studentName: options.studentName,
          paymentFor: options.paymentFor,
          studentFeeLedgerId: options.studentFeeLedgerId,
        },
      }),
    });

    const orderJson = await orderRes.json();
    if (orderJson.status !== 'success' || !orderJson.data?.orderId) {
      options.onFailure({
        code: 'ORDER_CREATION_FAILED',
        description: orderJson.message || 'Payment server failed to generate a secured order token.',
      });
      return;
    }

    const { orderId, amount: amountInPaise, keyId } = orderJson.data;

    // 2. Configure Standard Razorpay Checkout
    const rzpOptions = {
      key: keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_T5DcdVTGyG5UPE',
      amount: amountInPaise,
      currency: 'INR',
      name: 'ISML Foreign Languages Academy',
      description: options.paymentFor,
      image: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=150',
      order_id: orderId,
      prefill: {
        name: options.studentName,
        email: options.studentEmail,
        contact: options.studentPhone || '+91 97890 12345',
      },
      notes: {
        paymentFor: options.paymentFor,
        studentId: options.studentId,
      },
      theme: {
        color: '#0052CC',
      },
      modal: {
        ondismiss: () => {
          // Log intentional or accidental modal abandonment
          fetch(`${backendUrl}/api/portals/finance/razorpay/log-failure`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId,
              studentId: options.studentId,
              reason: 'USER_DISMISSED_CHECKOUT_MODAL',
              amount: options.amount,
            }),
          }).catch(() => {});

          if (options.onDismiss) {
            options.onDismiss();
          }
        },
      },
      handler: async function (response: {
        razorpay_payment_id: string;
        razorpay_order_id: string;
        razorpay_signature: string;
      }) {
        // 3. Cryptographic Signature Verification & DB Ledger Settlement
        try {
          const verifyRes = await fetch(`${backendUrl}/api/portals/finance/razorpay/verify-payment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              studentId: options.studentId,
              studentFeeLedgerId: options.studentFeeLedgerId,
              amountPaid: options.amount,
              paymentFor: options.paymentFor,
            }),
          });

          const verifyJson = await verifyRes.json();
          if (verifyJson.status === 'success' && verifyJson.verified) {
            options.onSuccess(verifyJson.data);
          } else {
            options.onFailure({
              code: 'VERIFICATION_FAILED',
              description: verifyJson.message || 'Payment signature could not be verified by server.',
            });
          }
        } catch (vErr: any) {
          options.onFailure({
            code: 'NETWORK_VERIFICATION_ERROR',
            description: vErr.message || 'Network disconnected while verifying payment receipt.',
          });
        }
      },
    };

    const rzpInstance = new (window as any).Razorpay(rzpOptions);

    // Track checkout failure / bank decline
    rzpInstance.on('payment.failed', function (resp: any) {
      const err = resp.error || {};
      fetch(`${backendUrl}/api/portals/finance/razorpay/log-failure`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          studentId: options.studentId,
          errorCode: err.code || 'GATEWAY_ERROR',
          errorDescription: err.description || 'Payment rejected by issuing bank',
          amount: options.amount,
        }),
      }).catch(() => {});

      options.onFailure({
        code: err.code || 'PAYMENT_FAILED',
        description: err.description || err.reason || 'Transaction failed or was rejected by your bank.',
        step: err.step,
      });
    });

    rzpInstance.open();
  } catch (err: any) {
    options.onFailure({
      code: 'UNEXPECTED_ERROR',
      description: err.message || 'An unexpected error occurred during checkout initialization.',
    });
  }
}

