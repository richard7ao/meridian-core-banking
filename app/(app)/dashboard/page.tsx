export default function DashboardPage() {
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">Meridian Operations Dashboard</h1>
      <div className="grid grid-cols-3 gap-4">
        <div className="border p-4 rounded">
          <h2 className="font-semibold">Active Wires</h2>
          <p className="text-3xl mt-2">—</p>
        </div>
        <div className="border p-4 rounded">
          <h2 className="font-semibold">Pending Approvals</h2>
          <p className="text-3xl mt-2">—</p>
        </div>
        <div className="border p-4 rounded">
          <h2 className="font-semibold">Compliance Alerts</h2>
          <p className="text-3xl mt-2">—</p>
        </div>
      </div>
    </main>
  );
}
