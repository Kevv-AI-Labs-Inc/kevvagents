export type Transaction = {
  address: string;
  city: string;
  price: string;
  type: string;
};

type AgentTransactionsProps = {
  transactions: Transaction[];
};

export default function AgentTransactions({ transactions }: AgentTransactionsProps) {
  if (transactions.length === 0) return null;

  return (
    <section id="transactions" className="mb-20 scroll-mt-24">
      <h3 className="text-2xl font-heading font-bold uppercase tracking-widest mb-8 border-l-4 border-primary pl-4">
        Past Transactions
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/40">
              <th className="text-left py-3 px-4 font-bold uppercase tracking-widest text-xs text-muted-foreground">
                Address
              </th>
              <th className="text-left py-3 px-4 font-bold uppercase tracking-widest text-xs text-muted-foreground">
                City
              </th>
              <th className="text-left py-3 px-4 font-bold uppercase tracking-widest text-xs text-muted-foreground">
                Price
              </th>
              <th className="text-left py-3 px-4 font-bold uppercase tracking-widest text-xs text-muted-foreground">
                Represented
              </th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx, i) => (
              <tr
                key={i}
                className="border-b border-border/20 hover:bg-card/30 transition-colors"
              >
                <td className="py-3 px-4">{tx.address}</td>
                <td className="py-3 px-4">{tx.city}</td>
                <td className="py-3 px-4 font-semibold">{tx.price}</td>
                <td className="py-3 px-4 text-primary">{tx.type}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
