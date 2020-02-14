import Layout from "../components/Layout";
import PageContext from "../contexts/page";
import { PAGE } from "../constants/PageURL";
import { Segment, Grid, Form, Button, Divider, Icon, TextArea } from "semantic-ui-react";
import { useState } from "react";
import { encodeToBase64, decodeToBase64 } from "../utils/base64";

export default function Base64Decoder() {
  const [ text, setText ] = useState("");
  const [ encode, setEncode ] = useState("");
  function handleTextChange(e){
    const value = e.target.value
    setText(value)
    setEncode(encodeToBase64(value))
  }
  function handleDecodeBase64(e){
    const value = e.target.value
    setEncode(value)
    setText(decodeToBase64(value))
  }

  return (
    <PageContext.Provider value={{ activeItem: PAGE.BASE_64_ENCODE_DECODER }}>
      <Layout title="String Length">
      <Segment>
          <Grid columns={2} relaxed="very" stackable>
            <Grid.Column>
              <Form>
                <TextArea value={text} placeholder='Please enter text you want to convert to base64' style={{ minHeight: 500 }} onChange={handleTextChange} />
              </Form>
            </Grid.Column>

            <Grid.Column verticalAlign="middle" stackable>
            <Form>
              <TextArea value={encode} placeholder='Tell us more' style={{ minHeight: 500 }} onChange={handleDecodeBase64} />
            </Form>
            </Grid.Column>
          </Grid>

          <Divider vertical>
            <Icon name="long arrow alternate right" />
            <Icon name="long arrow alternate left" />
            <br/>
            Encode and Decode
            
          </Divider>
        </Segment>
      </Layout>
    </PageContext.Provider>
  );
}
