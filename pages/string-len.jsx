import Layout from "../components/Layout";
import { Form, TextArea, Container, Statistic, Message, Icon } from "semantic-ui-react";
import PageContext from "../contexts/page";
import { PAGE } from "../constants/PageURL";
import { useState } from "react";

export default function StringLength() {
  const [text, setText] = useState("");
  const handleOnChange = e => setText(e.target.value);
  return (
    <PageContext.Provider value={{ activeItem: PAGE.STRING_LEN }}>
      <Layout title="String Length">
        <Container>
          <Form>
            <Message size='small' color="black" className="">Please input text you want to count</Message>
            <TextArea
              label="tets"
              value={text}
              name="text"
              placeholder="Please enter text you want to count length"
              style={{ minHeight: 500 }}
              onChange={handleOnChange}
              onInput={handleOnChange}
            />
          </Form>

          <Statistic.Group widths="one" size="huge" style={{padding: "100px"}}>
            <Statistic>
              <Statistic.Value>{text.length}</Statistic.Value>
              <Statistic.Label>
              <Icon name='chart line' />Text Length</Statistic.Label>
            </Statistic>
          </Statistic.Group>
        </Container>
      </Layout>
    </PageContext.Provider>
  );
}
