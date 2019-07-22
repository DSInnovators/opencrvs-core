import * as React from 'react'
import { SearchBlue, ArrowDownBlue, ClearText } from '../../icons'
import styled from 'styled-components'

const Wrapper = styled.form`
  align-items: center;
  background: ${({ theme }) => theme.colors.white};
  border-radius: 2px;
  display: flex;
  ${({ theme }) => theme.fonts.bodyStyle};
  padding: 0px 10px;
  margin-bottom: 1px;
  min-width: 400px;
  position: relative;
`
const SearchTextInput = styled.input`
  border: none;
  margin: 0px 10px;
  ${({ theme }) => theme.fonts.bodyStyle};
  flex-grow: 1;
  &:focus {
    outline: none;
  }
  &:-webkit-autofill {
    -webkit-box-shadow: 0 0 0px 1000px ${({ theme }) => theme.colors.white}
      inset;
  }
`
const DropDownWrapper = styled.ul`
  background: ${({ theme }) => theme.colors.white};
  border-radius: 2px;
  box-shadow: 0 0 12px 0 rgba(0, 0, 0, 0.11);
  position: absolute;
  width: 100%;
  z-index: 9999;
  list-style: none;
  padding: 0px;
  top: 100%;
  left: 0px;
  margin: 3px 0px;
`
const DropDownItem = styled.li`
  display: flex;
  align-items: center;
  border-bottom: solid 1px ${({ theme }) => theme.colors.background};
  padding: 0px 15px;
  cursor: pointer;
  &:nth-last-child {
    border-bottom: none;
  }
  &:hover {
    background: ${({ theme }) => theme.colors.dropdownHover};
  }
`
const IconWrapper = styled.span`
  display: flex;
  padding: 8px 16px;
`
const Label = styled.span`
  ${({ theme }) => theme.fonts.bodyStyle};
  color: ${({ theme }) => theme.colors.copy};
`
const SelectedSearchCriteria = styled.span`
  background: ${({ theme }) => theme.colors.secondary};
  border-radius: 2px;
  padding: 5px 10px;
  color: ${({ theme }) => theme.colors.white};
  ${({ theme }) => theme.fonts.captionStyle};
  margin-right: 10px;
`
const DropDown = styled.div`
  align-items: center;
  cursor: pointer;
  display: flex;
`
const ClearTextIcon = styled(ClearText)`
  margin: 0 5px;
`
export interface ISearchType {
  label: string
  value: string
  icon: React.ReactNode
  isDefault?: boolean
  placeHolderText: string
}
interface IState {
  dropDownIsVisible: boolean
  searchParam: string
  selectedSearchType: ISearchType
}
interface IProps {
  searchTypeList: ISearchType[]
  searchText?: string
  selectedSearchType?: string
  searchHandler: (searchText: string, searchType: string) => void
  onClearText?: () => void
}
export class SearchTool extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)

    this.state = {
      dropDownIsVisible: false,
      searchParam: this.props.searchText ? this.props.searchText : '',
      selectedSearchType: this.getDefaultSearchType()
    }
  }

  getDefaultSearchType(): ISearchType {
    if (this.props.selectedSearchType) {
      return (
        this.props.searchTypeList.find(
          (item: ISearchType) => item.value === this.props.selectedSearchType
        ) || this.props.searchTypeList[0]
      )
    }

    return (
      this.props.searchTypeList.find(
        (item: ISearchType) => item.isDefault === true
      ) || this.props.searchTypeList[0]
    )
  }
  search = () => {
    return (
      this.state.searchParam &&
      this.props.searchHandler(
        this.state.searchParam,
        this.state.selectedSearchType.value
      )
    )
  }
  dropdown() {
    return (
      this.state.dropDownIsVisible && (
        <DropDownWrapper>
          {this.props.searchTypeList.map(item => {
            return (
              <DropDownItem
                key={item.value}
                onClick={() => this.dropDownItemSelect(item)}
              >
                <IconWrapper>{item.icon}</IconWrapper>
                <Label>{item.label}</Label>
              </DropDownItem>
            )
          })}
        </DropDownWrapper>
      )
    )
  }
  dropDownItemSelect = (item: ISearchType) => {
    this.setState(_ => ({
      selectedSearchType: item,
      dropDownIsVisible: false
    }))
  }
  toggleDropdownDisplay = () => {
    const handler = () => {
      this.setState({ dropDownIsVisible: false })
      document.removeEventListener('click', handler)
    }
    if (!this.state.dropDownIsVisible) {
      document.addEventListener('click', handler)
    }

    this.setState(prevState => ({
      dropDownIsVisible: !prevState.dropDownIsVisible
    }))
  }
  onChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ searchParam: event.target.value, dropDownIsVisible: false })
  }

  onClearTextHandler = () => {
    const { onClearText } = this.props
    this.setState({ searchParam: '' })

    if (onClearText) {
      onClearText()
    }
  }

  render() {
    const { placeHolderText } = this.state.selectedSearchType
    return (
      <Wrapper action="javascript:void(0);" onSubmit={this.search}>
        <SearchBlue id="searchIconButton" onClick={this.search} />
        <SearchTextInput
          id="searchText"
          type="text"
          placeholder={placeHolderText}
          onChange={this.onChangeHandler}
          value={this.state.searchParam}
        />
        {this.state.searchParam && (
          <ClearTextIcon onClick={this.onClearTextHandler} />
        )}
        <DropDown onClick={this.toggleDropdownDisplay}>
          <SelectedSearchCriteria>
            {this.state.selectedSearchType.label}
          </SelectedSearchCriteria>
          <ArrowDownBlue />
        </DropDown>
        {this.dropdown()}
      </Wrapper>
    )
  }
}
