// DatumOS — custom legacy error page.
//
// Added because Next.js 14.2's INTERNAL pages/_error template renders
// next/head contexts (AmpStateContext / HeadManagerContext) which resolve to
// null during the app-router static export of /404 and /500, crashing
// `next build` ("Export encountered errors on _error"). This file replaces the
// internal template with a dependency-free component so the export pipeline
// completes and the production server can start. It is only used for error
// routes; the app itself remains app-router.

function ErrorPage({ statusCode }) {
  const code = statusCode || 500;
  const message =
    code === 404
      ? "Page not found"
      : code === 500
        ? "Internal server error"
        : "Unexpected error";
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0a0e14",
        color: "#f0f2f5",
        fontFamily: "'Rajdhani', 'Inter', sans-serif",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 72, fontWeight: 800, letterSpacing: 4 }}>
          {code}
        </div>
        <div style={{ fontSize: 20, color: "#94a3b8" }}>{message}</div>
        <div style={{ marginTop: 16, fontSize: 13, color: "#4d584d" }}>
          DATUM · DatumBIM OS
        </div>
      </div>
    </div>
  );
}

ErrorPage.getInitialProps = ({ res, err }) => {
  const statusCode = res
    ? res.statusCode
    : err
      ? err.statusCode
      : 404;
  return { statusCode };
};

export default ErrorPage;