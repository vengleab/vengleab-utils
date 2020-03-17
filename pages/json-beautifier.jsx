import {
  Segment, Divider, Form, TextArea,
} from 'semantic-ui-react';
import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import PageContext from '../contexts/page';
import { PAGE } from '../constants/PageURL';
import Demo from '../components/demo';
import JSONBeautifierStorage from '../utils/storage/JSON';

export default function JSONBeautifier() {
  const [JSONText, setJSONText] = useState('');

  useEffect(() => {
    setJSONText(JSONBeautifierStorage.get('JSONText'));
  });

  function handleTextChange(e) {
    const { value } = e.target;
    setJSONText(value);
    JSONBeautifierStorage.set('JSONText', value);
  }
  return (
    <PageContext.Provider value={{ activeItem: PAGE.JSON_BEAUTIFIER }}>
      <Layout title="JSON Beautifier">
        <Segment>
          <Form>
            <TextArea
              value={JSONText}
              onChange={handleTextChange}
              name="text"
              placeholder="Please enter json"
              style={{ minHeight: 200, maxHeight: 300 }}
            />
          </Form>
          <Divider />
          <Demo json={JSONText} />
        </Segment>
      </Layout>
    </PageContext.Provider>
  );
}
