import React, { Component } from "react";
import { connect } from 'react-redux';
import PageTitle from '../../../components/PageTitle';
import { fieldSelector, cropSelector, farmSelector } from '../../selector';
import DateContainer from '../../../components/Inputs/DateContainer';
import {actions, Form} from 'react-redux-form';
import DefaultLogForm from '../../../components/Forms/Log';
import Unit from '../../../components/Inputs/Unit';
import LogFooter from '../../../components/LogFooter';
import moment from 'moment';
import { addLog } from '../Utility/actions';
import styles from '../styles.scss';
import parseCrops from '../Utility/parseCrops';
import parseFields from '../Utility/parseFields';
import {convertToMetric, getUnit} from "../../../util";

class IrrigationLog extends Component{
  constructor(props) {
    super(props);
    this.props.dispatch(actions.reset('logReducer.forms.irrigationLog'));
    this.state = {
      date: moment(),
      ratePerMin: getUnit(this.props.farm, 'l/min', 'gal/min'),
      ratePerHr: getUnit(this.props.farm, 'l/h', 'gal/h'),
    };
    this.setDate = this.setDate.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  setDate(date){
    this.setState({
      date: date,
    });
  }

  handleSubmit(irrigationLog) {
    const { dispatch, fields } = this.props;
    let selectedCrops = parseCrops(irrigationLog);
    let selectedFields = parseFields(irrigationLog, fields);

    let formValue = {
      activity_kind: 'irrigation',
      date: this.state.date,
      crops: selectedCrops,
      fields: selectedFields,
      type: irrigationLog.type.value,
      notes: irrigationLog.notes,
      'flow_rate_l/min': convertToMetric(irrigationLog['flow_rate_l/min'], irrigationLog.unit, 'l/min'),
      hours: irrigationLog.hours,
      user_id: localStorage.getItem('user_id'),
    };
    dispatch(addLog(formValue));
  }

  render(){
    const crops = this.props.crops;
    const fields = this.props.fields;
    const rateOptions = [this.state.ratePerMin, this.state.ratePerHr];

    const customFieldset = () => {
      return (<div>
        <Unit model='.flow_rate_l/min' title='Flow Rate' dropdown={true} options={rateOptions}/>
        <Unit model='.hours' title='Total Time' type='hrs'/>
      </div>)
    };

    return(
      <div className="page-container">
        <PageTitle backUrl="/new_log" title="Irrigation Log"/>
        <DateContainer date={this.state.date} onDateChange={this.setDate} placeholder="Choose a date"/>
        <Form model="logReducer.forms" className={styles.formContainer} onSubmit={(val) => this.handleSubmit(val.irrigationLog)}>
          <DefaultLogForm
            style={styles.labelContainer}
            model=".irrigationLog"
            fields={fields}
            crops={crops}
            isCropNotRequired={false}
            notesField={true}
            typeField={true}
            typeOptions={['sprinkler', 'drip', 'subsurface', 'flood']}
            customFieldset={customFieldset}
          />
          <LogFooter />
        </Form>
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    crops: cropSelector(state),
    fields: fieldSelector(state),
    farm: farmSelector(state),
  }
};

const mapDispatchToProps = (dispatch) => {
  return {
    dispatch
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(IrrigationLog);
