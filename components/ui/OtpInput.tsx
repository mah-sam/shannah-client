// @ts-nocheck
import { Interaction, styled } from "@ui-kitten/components";
import React from "react";
import { TextInput } from "react-native";

@styled("OtpInput")
export class OtpInput extends React.Component {
  textInputRef = React.createRef();

  focus = () => {
    this.textInputRef.current?.focus();
  };

  onTextFieldFocus = (event) => {
    this.props.eva.dispatch([Interaction.FOCUSED]);
    this.props.onFocus?.(event);
  };

  onTextFieldBlur = (event) => {
    this.props.eva.dispatch([]);
    this.props.onBlur?.(event);
  };

  render() {
    const { eva, style, ...restProps } = this.props;

    return (
      <TextInput
        ref={this.textInputRef}
        style={[eva.style, style]}
        {...restProps}
        onFocus={this.onTextFieldFocus}
        onBlur={this.onTextFieldBlur}
      />
    );
  }
}
