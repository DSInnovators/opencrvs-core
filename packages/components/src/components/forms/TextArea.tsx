import * as React from 'react'
import styled from 'styled-components'

interface ITextAreaProps {
  ignoreMediaQuery?: boolean
}

const StyledTextArea = styled.textarea<ITextAreaProps>`
  width: 100%;
  padding: 10px;
  min-height: 80px;
  border: 0px solid;
  background-color: ${({ theme }) => theme.colors.inputBackground};
  font-size: 16px;
  color: ${({ theme }) => theme.colors.secondary};

  &::-webkit-input-placeholder {
    color: ${({ theme }) => theme.colors.placeholder};
  }
  &::-moz-placeholder {
    color: ${({ theme }) => theme.colors.placeholder};
  }
  &:-ms-input-placeholder {
    color: ${({ theme }) => theme.colors.placeholder};
  }

  ${({ ignoreMediaQuery, theme }) => {
    return !ignoreMediaQuery
      ? `@media (min-width: ${theme.grid.breakpoints.md}px) {
        width: 515px;
      }`
      : ''
  }}
`

export class TextArea extends React.Component {
  render() {
    return <StyledTextArea {...this.props} />
  }
}
