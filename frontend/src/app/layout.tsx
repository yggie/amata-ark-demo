import "./globals.css";
import "leaflet/dist/leaflet.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/*
        <head /> will contain the components returned by the nearest parent
        head.tsx. Find out more at https://beta.nextjs.org/docs/api-reference/file-conventions/head
      */}
      <head />
      <body>
        <main className="relative h-full min-h-screen w-full flex flex-col items-center">
          {/* <label htmlFor="menu" className="btn fixed top-0 right-0">
            Open modal
          </label>

          <input type="checkbox" id="menu" className="modal-toggle" />
          <div className="modal bg-red-100">
            <div className="modal-box shadow-none bg-transparent">
              <h3>Menu</h3>

              <div className="modal-action">
                <label htmlFor="menu" className="btn">
                  Dismiss
                </label>
              </div>
            </div>
          </div> */}

          <header className="p-2 flex flex-row w-full items-center justify-between shadow-sm">
            <a
              href="/"
              className="h-12 w-20 bg-cover bg-center bg-no-repeat rounded-sm"
              style={{
                backgroundImage: 'url("/assets/images/logos_black.png")',
              }}
            ></a>

            <nav>
              <ul>
                <li>
                  <button className="btn btn-sm btn-ghost">Login</button>
                </li>
              </ul>
            </nav>
          </header>

          <section className="flex-1 w-full">{children}</section>

          <footer className="p-4 w-full">
            <div className="h-[1px] bg-primary w-full max-w-xl mx-auto"></div>

            <div>Footer</div>
          </footer>
        </main>
      </body>
    </html>
  );
}
