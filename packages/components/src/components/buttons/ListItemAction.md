Button that is used to handle action for a list item. Renders an array of buttons and conditional expansion button.

```js
class ListItemActionExample extends React.Component {
  constructor() {
    super()
    this.state = { expanded: false }
    this.toggleExpansion = this.toggleExpansion.bind(this)
  }

  toggleExpansion() {
    this.setState((prevState, props) => ({
      expanded: !prevState.expanded
    }))
  }
  render() {
    return (
      <ListItemAction
        expanded={this.state.expanded}
        actions={[
          { label: 'Review', handler: () => alert('Hello') },
          { label: 'Delete', handler: () => alert('Hello') }
        ]}
        onExpand={this.toggleExpansion}
      />
    )
  }
}
;<ListItemActionExample />
```
