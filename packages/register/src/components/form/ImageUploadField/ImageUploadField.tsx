import * as React from 'react'
import { defineMessages, InjectedIntlProps, injectIntl } from 'react-intl'
import styled from 'styled-components'
import { IconAction } from '@opencrvs/components/lib/buttons'
import { Camera } from '@opencrvs/components/lib/icons'
import { IActionProps } from '@opencrvs/components/lib/buttons/Action'
import { ActionTitle } from '@opencrvs/components/lib/buttons/IconAction'
import { FileItem } from '@opencrvs/components/lib/files'
import { IFormSection, IFileValue } from 'src/forms'
import { ImageUploadOptionRenderer } from './ImageUploadOptionRenderer'

const Container = styled.div`
  width: 100%;
  border-bottom: 1px solid ${({ theme }) => theme.colors.background};
  padding-bottom: 35px;
`
const StyledIcon = styled(Camera)`
  border-radius: 2px;
  box-shadow: 0 0 4px 3px rgba(0, 0, 0, 0.1);
  height: 50px;
  width: 50px;
  background-color: ${({ theme }) => theme.colors.cardGradientEnd};
`
const PhotoIconAction = styled(IconAction)`
  outline-style: dashed;
  outline-color: ${({ theme }) => theme.colors.cardGradientEnd};
  outline-width: 1px;
  min-height: 90px;
  /* stylelint-disable */
  ${ActionTitle} {
    /* stylelint-enable */
    font-size: 18px;
    margin-left: 75px;
    line-height: 24px;
  }
`
const FileViewer = styled.div`
  margin-top: 15px;
`
const FileViewerLabel = styled.label`
  color: ${({ theme }) => theme.colors.primary};
  font-family: ${({ theme }) => theme.fonts.regularFont};
`
const FileItemContainer = styled.div`
  margin-top: 12px;
`
const messages = defineMessages({
  back: {
    id: 'menu.back',
    defaultMessage: 'Back',
    description: 'Back button in the menu'
  },
  uploadedList: {
    id: 'formFields.imageUpload.uploadedList',
    defaultMessage: 'Uploaded:',
    description: 'label for uploaded list'
  },
  delete: {
    id: 'formFields.imageUpload.delete',
    defaultMessage: 'Delete',
    description: 'label for delete a uploaded item'
  },
  preview: {
    id: 'formFields.imageUpload.preview',
    defaultMessage: 'Preview',
    description: 'label for preview a uploaded item'
  },
  upload: {
    id: 'register.form.upload',
    defaultMessage: 'Upload',
    description: 'title for option view'
  }
})

type IProps = {
  files?: IFileValue[]
  optionSection: IFormSection
  onComplete: (files: IFileValue[]) => void
}
type IFullProps = IActionProps & InjectedIntlProps & IProps
class ImageUploadComponent extends React.Component<
  IFullProps,
  {
    showNestedOptionSection: boolean
  }
> {
  constructor(props: IFullProps) {
    super(props)
    this.state = {
      showNestedOptionSection: false
    }
  }

  toggleNestedSection = () => {
    this.setState({
      showNestedOptionSection: !this.state.showNestedOptionSection
    })
  }

  onComplete = (file: IFileValue) => {
    const files = this.props.files ? this.props.files : []
    this.props.onComplete(files.concat(file))
    this.toggleNestedSection()
  }

  onDelete = (file: IFileValue, index: number) => {
    const files = this.props.files ? this.props.files : []
    delete files[index]
    files.splice(index, 1)
    console.log(files)
    this.props.onComplete(files)
  }

  render = () => {
    const { title, optionSection, files, intl } = this.props
    const fileList =
      (files &&
        files.length &&
        files.map((file: IFileValue & { subject: string }, index: number) => {
          file.subject = file.optionValues.join(' ')
          return (
            <FileItemContainer key={index}>
              <FileItem
                file={file}
                deleteLabel={intl.formatMessage(messages.delete)}
                onDelete={() => this.onDelete(file, index)}
                previewLabel={intl.formatMessage(messages.preview)}
                onPreview={() =>
                  /* need to change it for getting file.data using the index and use it for preview */
                  alert(`#${index} previewed`)
                }
              />
            </FileItemContainer>
          )
        })) ||
      ''
    return (
      <Container>
        <PhotoIconAction
          type="button"
          icon={() => <StyledIcon />}
          title={title}
          {...this.props}
          onClick={this.toggleNestedSection}
        />

        {fileList && (
          <FileViewer id="file_list_viewer">
            <FileViewerLabel>
              {intl.formatMessage(messages.uploadedList)}
            </FileViewerLabel>
            {fileList}
          </FileViewer>
        )}

        {this.state.showNestedOptionSection && (
          <ImageUploadOptionRenderer
            option={optionSection}
            title={intl.formatMessage(messages.upload)}
            backLabel={intl.formatMessage(messages.back)}
            onComplete={this.onComplete}
            toggleNestedSection={this.toggleNestedSection}
          />
        )}
      </Container>
    )
  }
}
export const ImageUploadField = injectIntl<IActionProps & IProps>(
  ImageUploadComponent
)
