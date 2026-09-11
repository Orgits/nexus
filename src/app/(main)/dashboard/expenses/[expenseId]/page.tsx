import { ExpenseDetail } from "./_components/expense-detail";

export default async function Page({ params }: { params: Promise<{ expenseId: string }> }) {
  const { expenseId } = await params;
  return <ExpenseDetail expenseId={expenseId} />;
}
