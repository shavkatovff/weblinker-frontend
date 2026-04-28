import { createHash } from 'node:crypto';

export function md5(value: string): string {
  return createHash('md5').update(value, 'utf8').digest('hex');
}

/** CLICK Prepare (action = 0) imzo tekshiruvi */
export function checkPrepareSign(
  secretKey: string,
  data: Record<string, unknown>,
): boolean {
  const raw =
    String(data.click_trans_id ?? '') +
    String(data.service_id ?? '') +
    secretKey +
    String(data.merchant_trans_id ?? '') +
    String(data.amount ?? '') +
    String(data.action ?? '') +
    String(data.sign_time ?? '');
  return md5(raw) === String(data.sign_string ?? '');
}

/** CLICK Complete (action = 1) imzo tekshiruvi */
export function checkCompleteSign(
  secretKey: string,
  data: Record<string, unknown>,
): boolean {
  const raw =
    String(data.click_trans_id ?? '') +
    String(data.service_id ?? '') +
    secretKey +
    String(data.merchant_trans_id ?? '') +
    String(data.merchant_prepare_id ?? '') +
    String(data.amount ?? '') +
    String(data.action ?? '') +
    String(data.sign_time ?? '');
  return md5(raw) === String(data.sign_string ?? '');
}
