import {
  Segment, Divider, Form, TextArea,
} from 'semantic-ui-react';
import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import PageContext from '../contexts/page';
import { PAGE } from '../constants/PageURL';
import Demo from '../components/JsonViewer';
import JWTStorage from '../utils/storage/JWT';
import { decodeToBase64 } from '../utils/base64';

const uncatchFunction = (fn) => (...args) =>{
  try { return fn(...args); } catch (error) {}
}

export default function JWT() {
  const [JWTText, setJWTText] = useState('');
  const [header, payload] = JWTText.split('.').map(decodeToBase64).map(uncatchFunction(JSON.parse));
  const json = {header, payload};

  useEffect(() => {
    setJWTText(JWTStorage.get('JWTText'));
  });

  function handleTextChange(e) {
    const { value } = e.target;
    setJWTText(value);
    JWTStorage.set('JWTText', value);
  }
  return (
    <PageContext.Provider value={{ activeItem: PAGE.JWT }}>
      <Layout title="JWT">
        <Segment>
          <Form>
            <TextArea
              value={JWTText}
              onChange={handleTextChange}
              name="text"
              placeholder="Please enter JWT"
              style={{ minHeight: 200, maxHeight: 300 }}
            />
          </Form>
          <Divider />
          <Demo json={json} />
        </Segment>
      </Layout>
    </PageContext.Provider>
  );
}
