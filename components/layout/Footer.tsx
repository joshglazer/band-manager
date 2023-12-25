export default function Footer() {
  return (
    <footer className="w-full flex justify-center border-t border-t-foreground/10 h-16">
      <div className="w-full max-w-4xl flex justify-between items-center p-3 text-xs">
        <div>
          A{' '}
          <a
            href="https://joshglazer.com"
            target="_blank"
            className="font-bold hover:underline"
            rel="noreferrer"
          >
            Josh Glazer
          </a>{' '}
          Project
        </div>
        <a
          href="https://github.com/joshglazer/band-manager"
          target="_blank"
          className="font-bold hover:underline"
          rel="noreferrer"
        >
          Source Code On Github
        </a>
      </div>
    </footer>
  );
}
