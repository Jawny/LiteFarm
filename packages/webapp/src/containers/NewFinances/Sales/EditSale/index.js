import React, {Component} from "react";
import PageTitle from "../../../../components/PageTitle";
import {connect} from "react-redux";
import defaultStyles from '../../../Finances/styles.scss';
import {actions} from 'react-redux-form';
import SaleForm from "../../../../components/Forms/Sale";
import {selectedSaleSelector} from '../../../Finances/selectors';
import {cropSelector as fieldCropSelector, farmSelector} from '../../../selector';
import {getFieldCrops} from "../../../actions";
import DateContainer from "../../../../components/Inputs/DateContainer";
import moment from "moment";
import {addOrUpdateSale, deleteSale} from "../../../Finances/actions";
import {convertFromMetric, convertToMetric, getUnit} from "../../../../util";
import ConfirmModal from "../../../../components/Modals/Confirm";
import history from "../../../../history";

class EditSale extends Component {
  constructor(props) {
    super(props);
    this.props.dispatch(actions.reset('financeReducer.forms.editSale'));
    const sale = this.props.sale || {};
    const chosenOptions = sale && sale.cropSale.map((cs) => {
      const crop = cs.fieldCrop.crop.crop_common_name;
      return { label: crop, value: cs.field_crop_id }
    });
    this.state = {
      date: moment.utc(sale && sale.date),
      quantity_unit: getUnit(this.props.farm, 'kg', 'lb'),
      chosenOptions
    };
    sale && sale.cropSale.forEach((cs) => {
      const crop = cs.fieldCrop.crop.crop_common_name;
      this.props.dispatch(actions.change(`financeReducer.forms.editSale.${crop}.quantity_kg`, cs.quantity_kg.toString()));
      this.props.dispatch(actions.change(`financeReducer.forms.editSale.${crop}.value`, cs.sale_value.toString()));
      this.props.dispatch(actions.change(`financeReducer.forms.editSale.${crop}.quantity_kg`, convertFromMetric(cs.quantity_kg.toString(), this.state.quantity_unit, 'kg').toString()));
    });
    this.props.dispatch(actions.change('financeReducer.forms.editSale.name', sale.customerName));
    this.props.dispatch(actions.change('financeReducer.forms.editSale.fieldCrop', chosenOptions));
    this.handleChooseCrop = this.handleChooseCrop.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
    this.props.dispatch(getFieldCrops());
  }

  handleChooseCrop(option) {
    this.setState({
      chosenOptions: option
    })
  }

  handleSubmit(form) {
    const { dispatch, sale } = this.props;
    const cropSale = this.state.chosenOptions.map((c) => {
      return {
        sale_value: form[c.label] && form[c.label].value && parseInt(form[c.label].value, 10),
        quantity_kg: sale[c.label] && sale[c.label].quantity_kg && convertToMetric(parseInt(sale[c.label].quantity_kg), this.state.quantity_unit, 'kg'),
        field_crop_id: c.value
      }
    });
    const editedSale = {
      sale_id: sale.id,
      customer_name: form.name,
      sale_date: this.state.date,
      cropSale
    };
    dispatch(addOrUpdateSale(editedSale));
    history.push('/newfinances/sales');
  }

  render() {
    let fieldCrops = this.props.fieldCrops || [];
    const cropOptions = fieldCrops.map((fc) => {
      return { label: fc.crop_common_name, value: fc.field_crop_id }
    });
    return (
      <div className={defaultStyles.financesContainer}>
        <PageTitle backUrl='/newfinances/sales' title='Edit Sale'/>
        <span className={defaultStyles.dateContainer}>
          <label>Date</label>
          <DateContainer
            style={defaultStyles.date}
            custom={true}
            date={this.state.date}
            onDateChange={(date) => this.setState({ date })}
          />
        </span>
        <SaleForm
          model="financeReducer.forms.editSale"
          cropOptions={cropOptions}
          chosenOptions={this.state.chosenOptions}
          handleChooseCrop={this.handleChooseCrop}
          onSubmit={this.handleSubmit}
          quantityUnit={this.state.quantity_unit}
          footerOnClick={() => this.setState({ showModal: true })}
          footerText={"Delete"}
        />
        <ConfirmModal
          open={this.state.showModal}
          onClose={() => this.setState({ showModal: false })}
          onConfirm={() => {this.props.dispatch(deleteSale(this.props.sale));history.push('/newfinances/sales');}}
          message='Are you sure you want to delete this sale?'
        />
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    sale: selectedSaleSelector(state),
    fieldCrops: fieldCropSelector(state),
    farm: farmSelector(state),
  }
};

const mapDispatchToProps = (dispatch) => {
  return {
    dispatch
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(EditSale);
