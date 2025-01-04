import {
  Form, Segment, Statistic, Icon, Grid, Divider,
} from 'semantic-ui-react';
import { useState } from 'react';
import FormatNumber from 'format-number';
import InputMast from '../../components/InputMask';
import Layout from '../../components/Layout';
import PageContext from '../../contexts/page';
import { PAGE } from '../../constants/PageURL';

const DollarFormatter = FormatNumber({ prefix: '$ ', round: 2 });

export default function JSONBeautifier() {
  const [net, setNetSalary] = useState();
  const [exchangeRate, setExchangeRate] = useState(4000);

  function calculateGrossSalary(netSalary) {
    if (Number.isNaN(netSalary) || netSalary <= 0) {
      return 0;
    }

    const brackets = [
      { limit: 1500000 / exchangeRate, rate: 0 },
      { limit: 2000000 / exchangeRate, rate: 0.05 },
      { limit: 8500000 / exchangeRate, rate: 0.1 },
      { limit: 12500000 / exchangeRate, rate: 0.15 },
      { limit: Infinity, rate: 0.2 },
    ];

    let cumulativeTax = 0;
    let lastNetMax = 0;
    let prevLimit = 0;
    for (let i = 0; i < brackets.length; i += 1) {
      const { limit, rate } = brackets[i];
      const currentRangeTaxable = (limit - prevLimit) * rate;
      const updatedCumulativeTax = currentRangeTaxable + cumulativeTax;
      const currentNetMax = limit - updatedCumulativeTax;

      if (netSalary > lastNetMax && netSalary < currentNetMax) {
        const currentTaxable = (netSalary - lastNetMax) / (1 - rate);
        return currentTaxable + prevLimit;
      }

      prevLimit = limit;
      cumulativeTax = updatedCumulativeTax;
      lastNetMax = currentNetMax;
    }
    return 0;
  }

  const grossSalary = calculateGrossSalary(net);

  return (
    <PageContext.Provider value={{ activeItem: PAGE.KH_SALARY_TAX_CALCULATOR }}>
      <Layout title="JSON Beautifier">
        <Segment>
          <Grid>
            <Grid.Row divided>
              <Grid.Column computer={7} mobile={16}>
                <Form>
                  <Form.Field>
                    <InputMast
                      label={{
                        color: 'teal',
                        content: 'Expected Net Salary',
                      }}
                      mask={{ prefix: '$ ', allowDecimal: true }}
                      onChange={setNetSalary}
                      placeholder="Amount you expect from your employer"
                    />
                  </Form.Field>

                  <Form.Field>
                    <InputMast
                      label={{
                        color: 'teal',
                        content: 'Exchange Rage',
                      }}
                      mask={{ prefix: 'KHR ' }}
                      value={exchangeRate}
                      onChange={setExchangeRate}
                      placeholder="Exchange Rate"
                    />
                  </Form.Field>
                </Form>
              </Grid.Column>
              <Grid.Column computer={9} mobile={16}>
                <Statistic.Group size="mini" className="result">
                  <Statistic>
                    <Statistic.Label>
                      <Icon name="chart line" />
                      Gross Salary <br />
                      &nbsp;
                    </Statistic.Label>
                    <Statistic.Value>
                      {!Number.isNaN(grossSalary) ? DollarFormatter(grossSalary) : '--'}
                    </Statistic.Value>
                  </Statistic>
                  <Statistic>
                    <Statistic.Label>
                      <Icon name="chart line" />
                      Net Salary
                      <br />
                      &nbsp;
                    </Statistic.Label>
                    <Statistic.Value>
                      {!Number.isNaN(net) ? DollarFormatter(net) : '--'}
                    </Statistic.Value>
                  </Statistic>
                </Statistic.Group>
              </Grid.Column>
            </Grid.Row>
          </Grid>
          <Divider />
        </Segment>
      </Layout>
    </PageContext.Provider>
  );
}
