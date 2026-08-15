export default function SiteFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-muted text-muted-foreground mt-0 flex flex-col items-center gap-3 px-4 py-6 font-mono text-xs tracking-tight uppercase">
      <nav aria-label="Footer">
        <a href="/papershelf/">papershelf</a>
        <span aria-hidden="true"> · </span>
        <a href="/maxims/">maxims</a>
        <span aria-hidden="true"> · </span>
        <a href="/tags/">tags</a>
      </nav>

      <div>© 2024-{currentYear} Mahibul Haque</div>
    </footer>
  );
}
