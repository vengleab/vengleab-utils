import {
  Form,
  TextArea,
  Statistic,
  Segment,
  Header,
  Icon,
  Divider,
} from 'semantic-ui-react';
import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import PageContext from '../contexts/page';
import { PAGE } from '../constants/PageURL';
import StringLengthStorage from '../utils/storage/StringLength';

export default function StringLength() {
  const [text, setText] = useState('');

  useEffect(() => {
    setText(StringLengthStorage.get('text'));
  }, []);

  const handleOnChange = (e) => {
    const { value } = e.target;
    setText(value);
    StringLengthStorage.set('text', value);
  };
  return (
    <PageContext.Provider value={{ activeItem: PAGE.STRING_LEN }}>
      <Layout title="String Length">
          <Segment>
            <Header as="h3">Please input text you want to count</Header>
            <Form>
              <TextArea
                label="tets"
                value={text}
                name="text"
                placeholder="Please enter text you want to count length"
                style={{ minHeight: 200, maxHeight: 300 }}
                onChange={handleOnChange}
                onInput={handleOnChange}
              />
            </Form>
            <Divider section />
            <Statistic.Group widths="one" size="huge">
              <Statistic>
                <Statistic.Value>{text.length}</Statistic.Value>
                <Statistic.Label>
                  <Icon name="chart line" />
                  Text Length
                </Statistic.Label>
              </Statistic>
            </Statistic.Group>
          </Segment>
      </Layout>
    </PageContext.Provider>
  );
}
