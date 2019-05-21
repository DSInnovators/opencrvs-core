import * as React from 'react'
import styled from 'styled-components'

export enum ICON_ALIGNMENT {
  LEFT,
  RIGHT
}

const ButtonBase = styled.button`
  width: auto;
  height: 48px;
  font-family: ${({ theme }) => theme.fonts.boldFont};
  border: 0;
  font-size: inherit;
  cursor: pointer;
  justify-content: center;
  background: transparent;
  &:disabled {
    background: ${({ theme }) => theme.colors.disabledButton};
    path {
      stroke: ${({ theme }) => theme.colors.disabled};
    }
  }
`
export interface IButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode | (() => React.ReactNode)
  align?: ICON_ALIGNMENT
}

export function Button({
  icon,
  children,
  align = ICON_ALIGNMENT.RIGHT,
  ...otherProps
}: IButtonProps) {
  icon = typeof icon === 'function' ? icon() : icon
  if (icon && children) {
    return (
      <ButtonBase {...otherProps}>
        <Wrapper>
          {icon && align === ICON_ALIGNMENT.LEFT && (
            <LeftButtonIcon>{icon}</LeftButtonIcon>
          )}
          {children}
          {icon && align === ICON_ALIGNMENT.RIGHT && (
            <RightButtonIcon>{icon}</RightButtonIcon>
          )}
        </Wrapper>
      </ButtonBase>
    )
  } else if (icon && !children) {
    return (
      <ButtonBase {...otherProps}>
        {' '}
        <IconOnly>{icon}</IconOnly>
      </ButtonBase>
    )
  } else {
    return (
      <ButtonBase {...otherProps}>
        <CenterWrapper>{children}</CenterWrapper>
      </ButtonBase>
    )
  }
}
const Wrapper = styled.div`
  padding: 0 32px;
  align-items: center;
  justify-content: space-between;
  display: inline-flex;
  width: 100%;
`
const CenterWrapper = styled.div`
  padding: 0 32px;
  align-items: center;
  justify-content: center;
  display: inline-flex;
`
const LeftButtonIcon = styled.div`
  position: relative !important;
  margin-right: 20px;
`
const RightButtonIcon = styled.div`
  position: relative !important;
  display: flex;
  justify-content: center;
  margin-left: 20px;
`
const IconOnly = styled.div`
  position: relative !important;
  padding: 0 8px;
`
