from __future__ import annotations

from typing import Iterable, Tuple

import numpy as np

from ..schemas.desking import DealStructure, GrossCalculation, PaymentCalculation


def compute_amount_financed(structure: DealStructure, sale_price: float) -> float:
    fees_total = sum(fee.amount for fee in structure.fees)
    taxes_total = sum(tax.amount for tax in structure.taxes)
    backend_total = sum(product.price for product in structure.backend_products or [])
    cash_total = structure.cash_down.total if structure.cash_down else 0.0
    trade_equity = (structure.trade.equity or 0.0) if structure.trade else 0.0
    payoff = (structure.trade.payoff or 0.0) if structure.trade else 0.0
    return float(max(sale_price + fees_total + taxes_total + backend_total - cash_total - trade_equity + payoff, 0.0))


def amortized_payment(amount: float, apr: float, term_months: int) -> float:
    if term_months <= 0:
        raise ValueError("term_months must be positive")
    monthly_rate = apr / 1200.0
    if monthly_rate <= 0:
        return float(amount / term_months)
    factor = (1 + monthly_rate) ** term_months
    payment = amount * monthly_rate * factor / (factor - 1)
    return float(payment)


def build_payment(amount: float, apr: float, term_months: int, due_at_signing: float = 0.0) -> PaymentCalculation:
    monthly = amortized_payment(amount, apr, term_months)
    return PaymentCalculation(
        amount_financed=float(round(amount, 2)),
        apr=float(round(apr, 3)),
        term_months=term_months,
        monthly_payment=float(round(monthly, 2)),
        due_at_signing=float(round(due_at_signing, 2)) if due_at_signing else None,
    )


def estimate_gross(
    structure: DealStructure,
    sale_price: float,
    payment: PaymentCalculation,
    vehicle_cost_basis: float,
) -> GrossCalculation:
    backend_products = structure.backend_products or []
    backend_profit = 0.0
    for product in backend_products:
        cost = product.cost if product.cost is not None else product.price * 0.55
        backend_profit += max(product.price - cost, 0.0)

    finance_reserve = payment.monthly_payment * 0.02 * (payment.term_months / 60.0)
    doc_fee = next((fee.amount for fee in structure.fees if fee.code.upper() == "DOC"), None)
    pack = next((fee.amount for fee in structure.fees if fee.code.upper() == "PACK"), None)

    front_end = sale_price - vehicle_cost_basis
    total = front_end + backend_profit + finance_reserve
    if doc_fee:
        total += doc_fee
    if pack:
        total -= pack

    return GrossCalculation(
        front_end=float(round(front_end, 2)),
        back_end=float(round(backend_profit, 2)),
        finance_reserve=float(round(finance_reserve, 2)),
        doc_fee=float(round(doc_fee, 2)) if doc_fee else None,
        pack=float(round(pack, 2)) if pack else None,
        total=float(round(total, 2)),
    )


def normalize(values: Iterable[float]) -> Tuple[float, float]:
    array = np.array(list(values), dtype=float)
    if array.size == 0:
        return 0.0, 1.0
    return float(array.min()), float(array.max() - array.min() or 1.0)
