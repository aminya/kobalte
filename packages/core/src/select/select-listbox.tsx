import { callHandler, mergeDefaultProps, mergeRefs } from "@kobalte/utils";
import {
	Component,
	JSX,
	ValidComponent,
	createEffect,
	onCleanup,
	splitProps,
} from "solid-js";

import * as Listbox from "../listbox";
import { ListboxRootCommonProps, ListboxRootRenderProps } from "../listbox";
import { PolymorphicProps } from "../polymorphic";
import { useSelectContext } from "./select-context";

export interface SelectListboxOptions<Option, OptGroup = never>
	extends Pick<
		Listbox.ListboxRootOptions<Option, OptGroup>,
		"scrollRef" | "scrollToItem" | "children"
	> {}

export interface SelectListboxCommonProps extends ListboxRootCommonProps {
	"aria-labelledby": string | undefined;
}

export interface SelectListboxRenderProps
	extends SelectListboxCommonProps,
		ListboxRootRenderProps {}

export type SelectListboxProps<Option, OptGroup = never> = SelectListboxOptions<
	Option,
	OptGroup
> &
	Partial<SelectListboxCommonProps>;

/**
 * Contains all the items of a `Select`.
 */
export function SelectListbox<
	Option = any,
	OptGroup = never,
	T extends ValidComponent = "ul",
>(props: PolymorphicProps<T, SelectListboxProps<Option, OptGroup>>) {
	const context = useSelectContext();

	const mergedProps = mergeDefaultProps(
		{
			id: context.generateId("listbox"),
		},
		props as SelectListboxProps<Option, OptGroup>,
	);

	const [local, others] = splitProps(mergedProps, ["ref", "id", "onKeyDown"]);

	createEffect(() => onCleanup(context.registerListboxId(local.id)));

	const onKeyDown: JSX.EventHandlerUnion<HTMLElement, KeyboardEvent> = (e) => {
		callHandler(e, local.onKeyDown);

		// Prevent from clearing the selection by `createSelectableCollection` on escape.
		if (e.key === "Escape") {
			e.preventDefault();
		}
	};

	return (
		<Listbox.Root<
			Option,
			OptGroup,
			Component<Omit<SelectListboxRenderProps, keyof ListboxRootRenderProps>>
		>
			ref={mergeRefs(context.setListboxRef, local.ref)}
			id={local.id}
			state={context.listState()}
			virtualized={context.isVirtualized()}
			autoFocus={context.autoFocus()}
			shouldSelectOnPressUp
			shouldFocusOnHover
			shouldFocusWrap={context.shouldFocusWrap()}
			disallowTypeAhead={context.disallowTypeAhead()}
			aria-labelledby={context.listboxAriaLabelledBy()}
			renderItem={context.renderItem}
			renderSection={context.renderSection}
			onKeyDown={onKeyDown}
			{...others}
		/>
	);
}
