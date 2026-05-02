/**
 * CLICK checkout URL — https://my.click.uz/services/pay
 */
export type CreateClickPaymentRes = {
  paymentId: number;
  merchantTransId: string;
  amount: number;
  amountSom: number;
  serviceId: number;
  merchantId: number;
  merchantUserId: string;
};

export function buildClickPayUrl(
  p: CreateClickPaymentRes,
  returnUrl: string,
): string {
  const amount = p.amountSom.toFixed(2);
  const q = new URLSearchParams({
    service_id: String(p.serviceId),
    merchant_id: String(p.merchantId),
    merchant_user_id: p.merchantUserId,
    amount,
    transaction_param: p.merchantTransId,
    return_url: returnUrl,
  });
  return `https://my.click.uz/services/pay?${q.toString()}`;
}
