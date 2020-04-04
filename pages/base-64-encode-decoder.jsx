import {
  Segment, Grid, Form, Divider, Icon, Header, TextArea,
} from 'semantic-ui-react';
import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import PageContext from '../contexts/page';
import { PAGE } from '../constants/PageURL';
import { encodeToBase64, decodeToBase64 } from '../utils/base64';
import Base64Storage from '../utils/storage/Base64';

export default function Base64Decoder() {
  const [text, setText] = useState('');
  const [encode, setEncode] = useState('');

  function textUpdate(value) {
    setText(value);
    Base64Storage.set('text', value);
    setEncode(encodeToBase64(value));
  }

  useEffect(() => {
    textUpdate(Base64Storage.get('text'));
  }, []);

  function handleTextChange(e) {
    const { value } = e.target;
    textUpdate(value);
  }

  function handleDecodeBase64(e) {
    const { value } = e.target;
    const txt = decodeToBase64(value);
    textUpdate(txt);
  }

  return (
    <PageContext.Provider value={{ activeItem: PAGE.BASE_64_ENCODE_DECODER }}>
      <Layout title="String Length">
        <Segment>
          <Grid columns={2} relaxed="very" stackable>
            <Grid.Column>
              <Header>Literal text</Header>
              <Form>
                <TextArea
                  value={text}
                  placeholder="Please enter text you want to convert to base64"
                  style={{ minHeight: 500 }}
                  onChange={handleTextChange}
                />
              </Form>
            </Grid.Column>

            <Grid.Column verticalAlign="middle" stackable="true">
              <Header>base64 text</Header>
              <Form>
                <TextArea
                  value={encode}
                  placeholder="Please enter text you want to convert to base64"
                  style={{ minHeight: 500 }}
                  onChange={handleDecodeBase64}
                />
              </Form>
            </Grid.Column>
          </Grid>

          <Divider vertical>
            <Icon name="long arrow alternate right" />
            <Icon name="long arrow alternate left" />
            <br />
          </Divider>
        </Segment>
      </Layout>
    </PageContext.Provider>
  );
}
