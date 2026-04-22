// @ts-nocheck
import { Interaction, styled } from "@ui-kitten/components";
import React from "react";
import { TextInput } from "react-native";
import * as theme from "../../theme.json";

/**
 * Single OTP cell. Eva-styled TextInput with explicit visual states:
 *   - empty   → default border
 *   - focused → primary-500 border + subtle background
 *   - filled  → primary-500 border, no focus tint (user moved on)
 *   - error   → danger border (red)
 *
 * We keep the existing Eva dispatch for FOCUSED so any consumer still
 * reading `eva.style` sees the right base style, and we layer the
 * prop-driven visual states on top via inline style — avoids having to
 * register new Eva states in mapping.json for a single-file polish.
 *
 * Supports SMS autofill: `autoComplete="one-time-code"` + `textContentType`
 * + `importantForAutofill` so iOS and Android offer the full-code paste.
 * The parent's `onChangeText` MUST accept strings longer than 1 char
 * (paste path) — see sign-in-mobile.tsx::handleOtpChange.
 */
@styled("OtpInput")
export class OtpInput extends React.Component {
  textInputRef = React.createRef();
  state = { focused: false };

  focus = () => {
    this.textInputRef.current?.focus();
  };

  onTextFieldFocus = (event) => {
    this.setState({ focused: true });
    this.props.eva?.dispatch?.([Interaction.FOCUSED]);
    this.props.onFocus?.(event);
  };

  onTextFieldBlur = (event) => {
    this.setState({ focused: false });
    this.props.eva?.dispatch?.([]);
    this.props.onBlur?.(event);
  };

  render() {
    const { eva, style, value, hasError, ...restProps } = this.props;
    const filled = typeof value === "string" && value.length > 0;
    const { focused } = this.state;

    const stateStyle = hasError
      ? {
          borderColor: theme["color-danger-500"] ?? "#DC2626",
          borderWidth: 1.5,
        }
      : focused
        ? {
            borderColor: theme["color-primary-500"],
            borderWidth: 1.5,
            backgroundColor: theme["color-primary-25"] ?? "#FAF5FF",
          }
        : filled
          ? {
              borderColor: theme["color-primary-500"],
              borderWidth: 1.5,
            }
          : null;

    return (
      <TextInput
        ref={this.textInputRef}
        style={[eva?.style, style, stateStyle]}
        autoComplete="one-time-code"
        textContentType="oneTimeCode"
        keyboardType="number-pad"
        importantForAutofill="yes"
        value={value}
        {...restProps}
        onFocus={this.onTextFieldFocus}
        onBlur={this.onTextFieldBlur}
      />
    );
  }
}
