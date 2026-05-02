type StripeCustomer = {
  id: string;
  email: string;
  name: string;
};

type ChargeResult = {
  chargeId: string;
  status: "succeeded" | "failed" | "pending";
  amount: number;
  currency: string;
};

const STRIPE_API = "https://api.stripe.com/v1";

export async function createCustomer(
  email: string,
  name: string
): Promise<StripeCustomer> {
  const res = await fetch(`${STRIPE_API}/customers`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ email, name }),
  });

  if (!res.ok) throw new Error(`Stripe error: ${res.status}`);
  return (await res.json()) as StripeCustomer;
}

export async function chargeCard(
  customerId: string,
  amount: number,
  currency: string = "usd"
): Promise<ChargeResult> {
  const res = await fetch(`${STRIPE_API}/charges`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      customer: customerId,
      amount: String(amount),
      currency,
    }),
  });

  if (!res.ok) throw new Error(`Stripe charge failed: ${res.status}`);
  const data = (await res.json()) as { id: string; status: string };

  return {
    chargeId: data.id,
    status: data.status as ChargeResult["status"],
    amount,
    currency,
  };
}

export async function createRecurringSubscription(
  customerId: string,
  priceId: string
): Promise<{ subscriptionId: string }> {
  const res = await fetch(`${STRIPE_API}/subscriptions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      customer: customerId,
      "items[0][price]": priceId,
    }),
  });

  if (!res.ok) throw new Error(`Subscription creation failed: ${res.status}`);
  const data = (await res.json()) as { id: string };
  return { subscriptionId: data.id };
}
