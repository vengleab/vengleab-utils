import {
  Form,
  TextArea,
  Container,
  Statistic,
  Segment,
  Header,
  Icon,
  Divider,
} from 'semantic-ui-react';
import { useState } from 'react';
import Layout from '../components/Layout';
import PageContext from '../contexts/page';
import { PAGE } from '../constants/PageURL';

export default function StringLength() {
  const [text, setText] = useState('');
  const handleOnChange = (e) => setText(e.target.value);
  return (
    <PageContext.Provider value={{ activeItem: PAGE.STRING_LEN }}>
      <Layout title="String Length">
        <Container>
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
        </Container>
      </Layout>
    </PageContext.Provider>
  );
}
