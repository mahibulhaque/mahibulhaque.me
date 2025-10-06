import type { PropsWithChildren, ElementType, ComponentPropsWithoutRef } from "react";

type Heading = "h2" | "h3" | "h4" | "h5" | "h6";

function Tag<T extends Heading>({
	children,
	element,
	...props
}: PropsWithChildren<{ element: T } & ComponentPropsWithoutRef<T>>) {
	// `ElementType` is a type-only annotation; `element` is a string at runtime
	const Element: ElementType = element;
	const id = (props as { id?: string }).id;

	return (
		<Element {...(props as ComponentPropsWithoutRef<T>)} className="group relative">
			<a
				title="Click to Copy Link"
				href={`#${id ?? ""}`}
				className="copy-hash-link-button absolute top-0 left-0 hidden w-12 text-pink-500 opacity-0 transition-all group-hover:-translate-x-10 group-hover:opacity-100 before:content-['#'] md:inline"
			/>
			<a
				title="Click to Copy Link"
				href={`#${id ?? ""}`}
				className="copy-hash-link-button text-pink-500 group-hover:before:content-['#_'] md:hidden"
			/>
			{children}
		</Element>
	);
}

export function H2Tag(props: ComponentPropsWithoutRef<"h2">) {
	return <Tag element="h2" {...props} />;
}

export function H3Tag(props: ComponentPropsWithoutRef<"h3">) {
	return <Tag element="h3" {...props} />;
}

export function H4Tag(props: ComponentPropsWithoutRef<"h4">) {
	return <Tag element="h4" {...props} />;
}

export function H5Tag(props: ComponentPropsWithoutRef<"h5">) {
	return <Tag element="h5" {...props} />;
}

export function H6Tag(props: ComponentPropsWithoutRef<"h6">) {
	return <Tag element="h6" {...props} />;
}
