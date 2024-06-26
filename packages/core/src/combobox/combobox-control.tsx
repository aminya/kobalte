import { OverrideComponentProps, isFunction, mergeRefs } from "@kobalte/utils";
import { Accessor, JSX, ValidComponent, children, splitProps } from "solid-js";

import { FormControlDataSet, useFormControlContext } from "../form-control";
import { Polymorphic, PolymorphicProps } from "../polymorphic";
import { ComboboxDataSet, useComboboxContext } from "./combobox-context";

export interface ComboboxControlState<Option> {
	/** The selected options. */
	selectedOptions: Accessor<Option[]>;

	/** A function to remove an option from the selection. */
	remove: (option: Option) => void;

	/** A function to clear the selection. */
	clear: () => void;
}

export interface ComboboxControlOptions<Option> {
	/**
	 * The children of the combobox control.
	 * Can be a `JSX.Element` or a _render prop_ for having access to the internal state.
	 */
	children?:
		| JSX.Element
		| ((state: ComboboxControlState<Option>) => JSX.Element);
}

export interface ComboboxControlCommonProps {
	ref: HTMLElement | ((el: HTMLElement) => void);
}

export interface ComboboxControlRenderProps
	extends ComboboxControlCommonProps,
		FormControlDataSet,
		ComboboxDataSet {
	children: JSX.Element;
}

export type ComboboxControlProps<Option> = ComboboxControlOptions<Option> &
	Partial<ComboboxControlCommonProps>;

/**
 * Contains the combobox input and trigger.
 */
export function ComboboxControl<Option, T extends ValidComponent = "div">(
	props: PolymorphicProps<T, ComboboxControlProps<Option>>,
) {
	const formControlContext = useFormControlContext();
	const context = useComboboxContext();

	const [local, others] = splitProps(props as ComboboxControlProps<Option>, [
		"ref",
		"children",
	]);

	const selectionManager = () => context.listState().selectionManager();

	return (
		<Polymorphic<ComboboxControlRenderProps>
			as="div"
			ref={mergeRefs(context.setControlRef, local.ref)}
			{...context.dataset()}
			{...formControlContext.dataset()}
			{...others}
		>
			<ComboboxControlChild
				state={{
					selectedOptions: () => context.selectedOptions(),
					remove: (option) => context.removeOptionFromSelection(option),
					clear: () => selectionManager().clearSelection(),
				}}
				children={local.children}
			/>
		</Polymorphic>
	);
}

interface ComboboxControlChildProps<Option>
	extends Pick<ComboboxControlOptions<Option>, "children"> {
	state: ComboboxControlState<Option>;
}

function ComboboxControlChild<Option>(
	props: ComboboxControlChildProps<Option>,
) {
	const resolvedChildren = children(() => {
		const body = props.children;
		return isFunction(body) ? body(props.state) : body;
	});

	return <>{resolvedChildren()}</>;
}
