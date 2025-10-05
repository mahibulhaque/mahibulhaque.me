import { useCallback, useState } from "react";
import { Menu, ArrowRight, Mail } from "react-feather";
import { cn } from "@utils/cn";

export function NavigationLink({
	title,
	href,
	initiallyActive,
}: {
	title: string;
	href: string;
	initiallyActive?: boolean;
}) {
	const active = initiallyActive;

	return (
		<a
			href={href}
			className={cn(
				"transition-colors hover:text-pink-600",
				active && "font-semibold underline underline-offset-4",
			)}
		>
			{title}
		</a>
	);
}

export default function Navigation({ path }: { path: string }) {
	const [open, setOpen] = useState(false);
	const toggle = useCallback(() => setOpen((open) => !open), [setOpen]);

	return (
		<nav className="">
			<div className="container mx-auto flex max-w-screen-lg flex-col px-4 py-5 md:flex-row">
				<div className="flex flex-row items-center justify-between">
					<a href="/" className="text-center text-xl leading-4 font-black uppercase">
						Mahibul
						<br />
						Haque
					</a>
					<button onClick={toggle} className="p-3 md:hidden">
						<Menu className="w-6" />
					</button>
				</div>
				<div
					className={cn(
						open ? "flex" : "hidden",
						"font-jetbrains-mono ml-4 flex flex-col space-y-2 pt-4 font-semibold md:ml-6 md:flex md:flex-row md:items-center md:space-y-0 md:space-x-4 md:pt-0",
					)}
				>
					<NavigationLink href="/" title="About Me" initiallyActive={path === "/"} />

					<NavigationLink href="#" title="Blog" initiallyActive={path.indexOf("/blog") >= 0} />

					<NavigationLink href="#" title="Résumé" />

					<a
						target={"_blank"}
						href="mailto:mahib@mahibulhaque.me"
						className="space-x-2 pl-5 transition-colors hover:text-pink-600"
					>
						<strong className="font-semibold">mahib</strong>@mahibulhaque.me
						<ArrowRight className="inline w-4" />
						<Mail className="inline w-4" />
					</a>
				</div>
			</div>
		</nav>
	);
}
