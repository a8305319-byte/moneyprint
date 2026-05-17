export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6 text-base">
      <section className="w-full max-w-xl space-y-4 rounded-xl bg-white p-8 shadow">
        <h1 className="text-3xl font-bold">登入系統</h1>
        <p className="text-lg">請輸入 Email 與密碼登入。</p>
        <input className="w-full rounded border px-4 py-3" placeholder="Email" type="email" />
        <input className="w-full rounded border px-4 py-3" placeholder="密碼" type="password" />
        <button className="w-full rounded bg-blue-600 px-4 py-3 text-white">登入</button>
        <p className="rounded border border-red-300 bg-red-50 px-4 py-3 text-red-700">
          帳號或密碼錯誤，請再確認一次。
        </p>
      </section>
    </main>
  );
}
