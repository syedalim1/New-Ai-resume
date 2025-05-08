import Link from "next/link";
import Logo from "@/components/icons/logo";

const Header = () => {
  return (
    <header className="bg-card border-b border-border shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center">
        <Link href="/" className="flex items-center gap-2">
          <Logo className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-semibold text-foreground">
            HireView AI
          </h1>
        </Link>
      </div>
    </header>
  );
};

export default Header;
