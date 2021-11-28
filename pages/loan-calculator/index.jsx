import {
  Form, Segment, Header, Input, Dropdown, Statistic, Icon, Grid,
} from 'semantic-ui-react';
import { useState } from 'react';
import MaskedInput from 'react-text-mask';
import createNumberMask from 'text-mask-addons/dist/createNumberMask';
import FormatNumber from 'format-number';
import _noop from 'lodash/noop';
import Layout from '../../components/Layout';
import PageContext from '../../contexts/page';
import { PAGE } from '../../constants/PageURL';
import './index.scss';

const TERM = {
  MONTHLY: 'month',
  YEARLY: 'year',
};
const DollarFormatter = FormatNumber({ prefix: '$ ', round: 2 });
const options = Object.entries(TERM).map(([key, value]) => ({ key, value, text: key }));
const EMICalculator = (principle, monthlyRate, totalMonths) => (principle * monthlyRate * (1 + monthlyRate) ** totalMonths)
  / ((1 + monthlyRate) ** totalMonths - 1);

const getTotalMonths = (period, term) => (term === TERM.MONTHLY ? period : period * 12);

const getMonthRate = (rate, term) => (term === TERM.MONTHLY ? rate : rate / 12);

const CustomInput = ({ mask = {}, onChange = _noop, ...props }) => {
  const { suffix = '', prefix = '' } = mask;

  function handleInputChange(_, e) {
    const { value = '' } = e;

    onChange(value.substring(prefix.length, value.length - suffix.length).replaceAll(',', ''));
  }

  return (
    <Input
      onChange={handleInputChange}
      input={(e, inputProps) => (
        <MaskedInput mask={createNumberMask(mask)} guide={true} {...inputProps} />
      )}
      {...props}
    />
  );
};

export default function LoadCalculator() {
  const [principle, setPrinciple] = useState();
  const [rate, setRate] = useState();
  const [period, setPeriod] = useState();
  const [term, setTerm] = useState(TERM.YEARLY);
  const totalMonths = getTotalMonths(period, term);
  const monthlyRate = getMonthRate(rate, term) / 100;
  const emi = EMICalculator(principle, monthlyRate, totalMonths);

  return (
    <PageContext.Provider value={{ activeItem: PAGE.LOAN_CALCULATOR }}>
      <Layout title="Loan Calculator">
        <Segment>
          <Header as="h3" style={{ paddingBottom: 20, textAlign: 'center' }}>
            EMI (Equated monthly installment) Calculator for Home Loan, Car Loan & Personal Loan
          </Header>
          <Grid>
            <Grid.Row divided>
              <Grid.Column width={7}>
                <Form>
                  <Form.Field>
                    <CustomInput
                      label={{
                        color: 'teal',
                        content: 'Principle ( Loan amount )',
                      }}
                      mask={{ prefix: '$ ', allowDecimal: true }}
                      onChange={setPrinciple}
                      placeholder="Amount you take from Finance institute"
                    />
                  </Form.Field>
                  <Form.Field>
                    <CustomInput
                      action={
                        <Dropdown
                          button
                          basic
                          floating
                          options={options}
                          defaultValue={term}
                          onChange={(_, { value }) => {
                            setTerm(value);
                          }}
                        />
                      }
                      label={{
                        color: 'teal',
                        labelPosition: 'left',
                        content: 'Rate (%)',
                      }}
                      mask={{ prefix: '', suffix: ' %', allowDecimal: true }}
                      onChange={setRate}
                      labelPosition="left"
                      placeholder="Year / Monthly Rate"
                    />
                  </Form.Field>
                  <Form.Field>
                    <CustomInput
                      label={{
                        color: 'teal',
                        labelPosition: 'left',
                        content: 'Period ( Years / Months )',
                        width: '50px',
                      }}
                      onChange={setPeriod}
                      labelPosition="left"
                      placeholder="Total Period"
                      mask={{
                        prefix: '',
                        suffix: ` ${term}`,
                        allowDecimal: true,
                      }}
                    />
                  </Form.Field>
                </Form>
              </Grid.Column>
              <Grid.Column width={9}>
                <Statistic.Group size="mini" className="result">
                  <Statistic>
                    <Statistic.Label>
                      <Icon name="chart line" />
                      Monthly payment <br />
                      &nbsp;
                    </Statistic.Label>
                    <Statistic.Value>{!isNaN(emi) ? DollarFormatter(emi) : '--'}</Statistic.Value>
                  </Statistic>
                  <Statistic>
                    <Statistic.Label>
                      <Icon name="chart line" />
                      Total months
                      <br />
                      &nbsp;
                    </Statistic.Label>
                    <Statistic.Value>{!isNaN(emi) ? totalMonths : '--'}</Statistic.Value>
                  </Statistic>
                  <Statistic>
                    <Statistic.Label>
                      <Icon name="chart line" />
                      Total Payment <br />
                      (Principal + Interest)
                    </Statistic.Label>
                    <Statistic.Value>
                      {!isNaN(emi) ? DollarFormatter(totalMonths * emi) : '--'}
                    </Statistic.Value>
                  </Statistic>
                </Statistic.Group>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Segment>
      </Layout>
    </PageContext.Provider>
  );
}
