import React from 'react';
import {
  Select, Grid, Sidebar, Menu, Ref, Icon,
} from 'semantic-ui-react';

import dynamic from 'next/dynamic';

const ReactSelect = (props) => (
  <Select
    {...props}
    style={{
      minWidth: '100%',
    }}
    onChange={(e, data) => {
      props.onChange(data);
    }}
  />
);
const ReactJson = dynamic(() => import('react-json-view'), { ssr: false });

export default class JSONView extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const {
      collapseStringsAfter,
      onAdd,
      onEdit,
      onDelete,
      displayObjectSize,
      enableClipboard,
      iconStyle,
      collapsed,
      indentWidth,
      displayDataTypes,
      visible,
      theme = 'monokai',
    } = this.state;
    const style = {
      minHeight: '350px',
      padding: '10px',
      borderRadius: '3px',
      margin: '10px 0px',
    };
    const { json } = this.props;

    const segmentRef = React.createRef();
    return (
      <div className="rjv-demo">
        <div onClick={() => this.setState({ visible: !this.state.visible })} ><Icon size="big" name="options"/></div>
        <Sidebar.Pushable style={{ overflow: 'initial' }} raised="true">
          <Sidebar
            as={Menu}
            animation="overlay"
            icon="labeled"
            onHide={() => this.setState({ visible: false })}
            vertical
            target={segmentRef}
            visible={visible}
            width="very wide"
            style={{ padding: '10px', overflow: 'hidden', paddingTop: '30px' }}
          >
            <Grid>
              <Grid.Row>
                <Grid.Column width={16}>
                  <Grid columns={2}>
                    <Grid.Row>
                      <Grid.Column>
                        <div className="rjv-text">Theme:</div>
                        {this.getThemeInput(theme)}
                      </Grid.Column>
                      <Grid.Column>
                        <div className="rjv-text">Icon Style:</div>
                        {this.getIconStyleInput(iconStyle)}
                      </Grid.Column>
                      <Grid.Column>
                        <div className="rjv-text">Enable Edit:</div>
                        {this.getEditInput(onEdit)}
                      </Grid.Column>
                      <Grid.Column>
                        <div className="rjv-text">Enable Add:</div>
                        {this.getAddInput(onAdd)}
                      </Grid.Column>
                      <Grid.Column>
                        <div className="rjv-text">Enable Delete:</div>
                        {this.getDeleteInput(onDelete)}
                      </Grid.Column>
                      <Grid.Column>
                        <div className="rjv-text">Enable Clipboard:</div>
                        {this.getEnableClipboardInput(enableClipboard)}
                      </Grid.Column>
                      <Grid.Column>
                        <div className="rjv-text">Display Data Types:</div>
                        {this.getDataTypesInput(displayDataTypes)}
                      </Grid.Column>
                      <Grid.Column>
                        <div className="rjv-text">Display Object Size:</div>
                        {this.getObjectSizeInput(displayObjectSize)}
                      </Grid.Column>
                      <Grid.Column>
                        <div className="rjv-text">Indent Width:</div>
                        {this.getIndentWidthInput(indentWidth)}
                      </Grid.Column>
                      <Grid.Column>
                        <div className="rjv-text">Collapsed:</div>
                        {this.getCollapsedInput(collapsed)}
                      </Grid.Column>
                      <Grid.Column>
                        <div className="rjv-text">Collapse Strings After Length:</div>
                        {this.getCollapsedStringsInput(collapseStringsAfter)}
                      </Grid.Column>
                    </Grid.Row>
                  </Grid>
                </Grid.Column>
              </Grid.Row>
            </Grid>
          </Sidebar>
          <Ref innerRef={segmentRef}>
            <Grid>
              <Grid.Row divided>
                <Grid.Column>
                  <ReactJson
                    name={false}
                    collapsed={collapsed}
                    style={style}
                    theme={theme}
                    src={json}
                    collapseStringsAfterLength={collapseStringsAfter}
                    onEdit={
                      onEdit
                        ? (e) => {
                          this.setState({ src: e.updated_src });
                        }
                        : false
                    }
                    onDelete={
                      onDelete
                        ? (e) => {
                          this.setState({ src: e.updated_src });
                        }
                        : false
                    }
                    onAdd={
                      onAdd
                        ? (e) => {
                          this.setState({ src: e.updated_src });
                        }
                        : false
                    }
                    displayObjectSize={displayObjectSize}
                    enableClipboard={enableClipboard}
                    indentWidth={indentWidth}
                    displayDataTypes={displayDataTypes}
                    iconStyle={iconStyle}
                  />
                </Grid.Column>
              </Grid.Row>
            </Grid>
          </Ref>
        </Sidebar.Pushable>

        {this.getNotes(onEdit, onAdd)}
      </div>
    );
  }

  getNotes = (onEditEnable, onAddEnable) => {
    const notes = [];
    if (onEditEnable) {
      notes.push(
        <span>
          To edit a value, try <code>ctrl/cmd + click</code> enter edit mode
        </span>,
      );
      notes.push(
        <span>
          When editing a value, try <code>ctrl/cmd + Enter</code> to submit changes
        </span>,
      );
      notes.push(
        <span>
          When editing a value, try <code>Escape</code> key to cancel
        </span>,
      );
    }
    if (onAddEnable) {
      notes.push(
        <span>
          When adding a new key, try <code>Enter</code> to submit
        </span>,
      );
      notes.push(
        <span>
          When adding a new key, try <code>Escape</code> to cancel
        </span>,
      );
    }

    if (notes.length === 0) {
      return null;
    }

    return (
      <div style={{ marginTop: '20px', fontStyle: 'italic' }}>
        Keyboard Shortcuts
        <ul>
          {notes.map((note, index) => (
            <li key={index}>{note}</li>
          ))}
        </ul>
      </div>
    );
  };

  getIconStyleInput = (iconStyle) => (
    <ReactSelect
      name="icon-style"
      value={iconStyle}
      options={[
        { value: 'circle', text: 'circle' },
        { value: 'square', text: 'square' },
        { value: 'triangle', text: 'triangle' },
      ]}
      onChange={(val) => {
        this.set('iconStyle', val);
      }}
    />
  );

  getEditInput = (onEdit) => (
    <ReactSelect
      name="enable-edit"
      value={onEdit}
      options={[
        { value: true, text: 'true' },
        { value: false, text: 'false' },
      ]}
      onChange={(val) => {
        this.set('onEdit', val);
      }}
    />
  );

  getAddInput = (onAdd) => (
    <ReactSelect
      name="enable-add"
      value={onAdd}
      options={[
        { value: true, text: 'true' },
        { value: false, text: 'false' },
      ]}
      onChange={(val) => {
        this.set('onAdd', val);
      }}
    />
  );

  getDeleteInput = (onDelete) => (
    <ReactSelect
      name="enable-delete"
      value={onDelete}
      options={[
        { value: true, text: 'true' },
        { value: false, text: 'false' },
      ]}
      onChange={(val) => {
        this.set('onDelete', val);
      }}
    />
  );

  getEnableClipboardInput = (enableClipboard) => (
    <ReactSelect
      name="enable-clipboard"
      value={enableClipboard}
      options={[
        { value: true, text: 'true' },
        { value: false, text: 'false' },
      ]}
      onChange={(val) => {
        this.set('enableClipboard', val);
      }}
    />
  );

  getObjectSizeInput = (displayObjectSize) => (
    <ReactSelect
      name="display-object-size"
      value={displayObjectSize}
      options={[
        { value: true, text: 'true' },
        { value: false, text: 'false' },
      ]}
      onChange={(val) => {
        this.set('displayObjectSize', val);
      }}
    />
  );

  getDataTypesInput = (displayDataTypes) => (
    <ReactSelect
      name="display-data-types"
      value={displayDataTypes}
      options={[
        { value: true, text: 'true' },
        { value: false, text: 'false' },
      ]}
      onChange={(val) => {
        this.set('displayDataTypes', val);
      }}
    />
  );

  getCollapsedStringsInput = (collapseStringsAfter) => (
    <ReactSelect
      name="collapse-strings"
      value={collapseStringsAfter}
      options={[
        { value: false, text: 'false' },
        { value: 5, text: 5 },
        { value: 10, text: 10 },
        { value: 15, text: 15 },
        { value: 20, text: 20 },
      ]}
      onChange={(val) => {
        this.set('collapseStringsAfter', val);
      }}
    />
  );

  getCollapsedInput = (collapsed) => (
    <ReactSelect
      name="collapsed"
      value={collapsed}
      options={[
        { value: true, text: 'true' },
        { value: false, text: 'false' },
        { value: 1, text: 1 },
        { value: 2, text: 2 },
      ]}
      onChange={(val) => {
        this.set('collapsed', val);
      }}
    />
  );

  getIndentWidthInput = (indentWidth) => (
    <ReactSelect
      name="indent-width"
      value={indentWidth}
      options={[
        { value: 0, text: 0 },
        { value: 1, text: 1 },
        { value: 2, text: 2 },
        { value: 3, text: 3 },
        { value: 4, text: 4 },
        { value: 5, text: 5 },
        { value: 6, text: 6 },
        { value: 7, text: 7 },
        { value: 8, text: 8 },
        { value: 9, text: 9 },
        { value: 10, text: 10 },
      ]}
      onChange={(val) => {
        this.set('indentWidth', val);
      }}
    />
  );

  getThemeInput = (theme) => (
    <ReactSelect
      name="theme-select"
      value={theme}
      options={[
        { value: 'apathy', text: 'apathy' },
        { value: 'apathy:inverted', text: 'apathy:inverted' },
        { value: 'ashes', text: 'ashes' },
        { value: 'bespin', text: 'bespin' },
        { value: 'brewer', text: 'brewer' },
        { value: 'bright:inverted', text: 'bright:inverted' },
        { value: 'bright', text: 'bright' },
        { value: 'chalk', text: 'chalk' },
        { value: 'codeschool', text: 'codeschool' },
        { value: 'colors', text: 'colors' },
        { value: 'eighties', text: 'eighties' },
        { value: 'embers', text: 'embers' },
        { value: 'flat', text: 'flat' },
        { value: 'google', text: 'google' },
        { value: 'grayscale', text: 'grayscale' },
        {
          value: 'grayscale:inverted',
          text: 'grayscale:inverted',
        },
        { value: 'greenscreen', text: 'greenscreen' },
        { value: 'harmonic', text: 'harmonic' },
        { value: 'hopscotch', text: 'hopscotch' },
        { value: 'isotope', text: 'isotope' },
        { value: 'marrakesh', text: 'marrakesh' },
        { value: 'mocha', text: 'mocha' },
        { value: 'monokai', text: 'monokai' },
        { value: 'ocean', text: 'ocean' },
        { value: 'paraiso', text: 'paraiso' },
        { value: 'pop', text: 'pop' },
        { value: 'railscasts', text: 'railscasts' },
        { value: 'rjv-default', text: 'rjv-default' },
        { value: 'shapeshifter', text: 'shapeshifter' },
        {
          value: 'shapeshifter:inverted',
          text: 'shapeshifter:inverted',
        },
        { value: 'solarized', text: 'solarized' },
        { value: 'summerfruit', text: 'summerfruit' },
        {
          value: 'summerfruit:inverted',
          text: 'summerfruit:inverted',
        },
        { value: 'threezerotwofour', text: 'threezerotwofour' },
        { value: 'tomorrow', text: 'tomorrow' },
        { value: 'tube', text: 'tube' },
        { value: 'twilight', text: 'twilight' },
      ]}
      onChange={(val) => {
        this.set('theme', val);
      }}
    />
  );

  set = (field, value) => {
    const state = {};
    state[field] = value.value;
    this.setState(state);
  };
}
