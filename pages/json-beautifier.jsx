import {
  Segment, Divider, Form, TextArea,
} from 'semantic-ui-react';
import { useState } from 'react';
import Layout from '../components/Layout';
import PageContext from '../contexts/page';
import { PAGE } from '../constants/PageURL';
import Demo from '../components/demo';

export default function JSONBeautifier() {
  const [JSONText, setJSONText] = useState('');

  function handleTextChange(e) {
    const { value } = e.target;
    setJSONText(value);
  }
  return (
    <PageContext.Provider value={{ activeItem: PAGE.JSON_BEAUTIFIER }}>
      <Layout title="Vengleab Utilities">
        <Segment>
          <Form>
            <TextArea
              value={JSONText}
              onChange={handleTextChange}
              name="text"
              placeholder="Please enter text you want to count length"
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
