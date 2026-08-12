import HeartbeatMonitor from "@/components/HeartbeatMonitor";

export default function Home() {
  return (
    <main className="h-dvh w-full overflow-hidden bg-[#01040d] text-white">
      <h1 className="sr-only">
        Monitor de batimento cardíaco — simulação visual sem finalidade médica
      </h1>
      <HeartbeatMonitor />
    </main>
  );
}
