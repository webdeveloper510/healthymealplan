
import React from 'react';
import { Meteor } from 'meteor/meteor';

import sumBy from 'lodash/sumBy';

import Typography from 'material-ui/Typography';
import Grid from 'material-ui/Grid';

class OrderSummary extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      primaryProfileBilling: this.props.primaryProfileBilling,
      secondaryProfilesBilling: this.props.secondaryProfilesBilling,
    };
  }

  render() {
    return (
      <div style={{ padding: '24px  48px' }}>
        <Grid container>
          <Grid item xs={12} sm={12}>
            <Typography
              type="headline"
              style={{ marginBottom: '25px' }}
            >
              Overview
            </Typography>
            <Typography
              type="title"
              className="font-medium font-uppercase"
              style={{ marginTop: '.75em', marginBottom: '.75em' }}
            >
              Meal Plan
            </Typography>

            <Typography
              type="title"
              style={{
                marginTop: '.75em',
                marginBottom: '.75em',
              }}
            >
              {this.state.primaryProfileBilling
                ? this.state.primaryProfileBilling.lifestyle.title
                : ''}
            </Typography>

            <Grid container>
              <Grid item xs={6}>
                <Typography type="subheading">
                  {this.state.primaryProfileBilling
                    ? `${this.state.primaryProfileBilling.breakfast
                      .totalQty +
                    this.state.primaryProfileBilling.lunch
                      .totalQty +
                    this.state.primaryProfileBilling.dinner
                      .totalQty +
                      this.state.primaryProfileBilling.chefsChoiceBreakfast
                        .totalQty +
                        this.state.primaryProfileBilling.chefsChoiceLunch
                          .totalQty +
                          this.state.primaryProfileBilling.chefsChoiceDinner
                            .totalQty} meals`
                    : ''}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography
                  type="subheading"
                  style={{ textAlign: 'right' }}
                >
                  ${this.state.primaryProfileBilling
                    ? parseFloat(this.state.primaryProfileBilling.breakfast
                      .totalQty *
                    this.state.primaryProfileBilling
                      .breakfastPrice +
                    this.state.primaryProfileBilling.lunch
                      .totalQty *
                    this.state.primaryProfileBilling.lunchPrice +
                    this.state.primaryProfileBilling.dinner
                      .totalQty *
                    this.state.primaryProfileBilling.dinnerPrice +
                    this.state.primaryProfileBilling.chefsChoiceBreakfast
                      .totalQty *
                    this.state.primaryProfileBilling.chefsChoiceBreakfastPrice +
                    this.state.primaryProfileBilling.chefsChoiceLunch
                      .totalQty *
                    this.state.primaryProfileBilling.chefsChoiceLunchPrice +
                    this.state.primaryProfileBilling.chefsChoiceDinner
                      .totalQty *
                    this.state.primaryProfileBilling.chefsChoiceDinnerPrice).toFixed(2)
                    : ''}
                </Typography>
              </Grid>
            </Grid>

            {this.state.primaryProfileBilling &&
              this.state.primaryProfileBilling.discountActual ? (
                <Grid container>
                  <Grid item xs={12}>
                    <Typography
                      type="body2"
                      className="font-medium font-uppercase"
                      style={{ marginTop: '.75em' }}
                    >
                      Discount
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography type="subheading">
                      {this.state.primaryProfileBilling.discount
                        .charAt(0)
                        .toUpperCase() +
                        this.state.primaryProfileBilling.discount.substr(
                          1,
                          this.state.primaryProfileBilling.discount
                            .length,
                        )}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography
                      type="subheading"
                      style={{ textAlign: 'right' }}
                    >
                      -${parseFloat(this.state.primaryProfileBilling.discountActual).toFixed(2)}
                    </Typography>
                  </Grid>

                </Grid>
              ) : (
                ''
              )}

            {this.state.primaryProfileBilling &&
              (this.state.primaryProfileBilling.totalAthleticSurcharge >
                0 ||
                this.state.primaryProfileBilling
                  .totalBodybuilderSurcharge > 0) ? (
                <Grid item xs={12}>
                  <Typography
                    type="body2"
                    className="font-medium font-uppercase"
                    style={{ marginTop: '.75em' }}
                  >
                    Extra
                  </Typography>
                </Grid>
              ) : (
                ''
              )}

            {this.state.primaryProfileBilling &&
              this.state.primaryProfileBilling.totalAthleticSurcharge >
              0 ? (
                <Grid container>
                  <Grid item xs={6}>
                    <Typography type="subheading">Athletic</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography
                      type="subheading"
                      style={{ textAlign: 'right' }}
                    >
                      ${parseFloat(this.state.primaryProfileBilling.totalAthleticSurcharge).toFixed(2)}{' '}
                      ({this.state.primaryProfileBilling.lifestyle
                        .discountOrExtraTypeAthletic === 'Fixed amount'
                        ? '$'
                        : ''}
                      {parseFloat(this.state.primaryProfileBilling.lifestyle.extraAthletic).toFixed(2)}
                      {this.state.primaryProfileBilling.lifestyle
                        .discountOrExtraTypeAthletic === 'Percentage'
                        ? '%'
                        : ''})
                    </Typography>
                  </Grid>
                </Grid>
              ) : (
                ''
              )}

            {this.state.primaryProfileBilling &&
              this.state.primaryProfileBilling
                .totalBodybuilderSurcharge > 0 ? (
                <Grid container>
                  <Grid item xs={12} sm={6}>
                    <Typography type="subheading">
                      Bodybuilder
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography
                      type="subheading"
                      style={{ textAlign: 'right' }}
                    >
                      ${parseFloat(this.state.primaryProfileBilling.totalBodybuilderSurcharge).toFixed(2)}{' '}
                      ({this.state.primaryProfileBilling.lifestyle
                        .discountOrExtraTypeBodybuilder ===
                        'Fixed amount'
                        ? '$'
                        : ''}
                      {parseFloat(this.state.primaryProfileBilling.lifestyle.extraBodybuilder).toFixed(2)}

                      {this.state.primaryProfileBilling.lifestyle
                        .discountOrExtraTypeBodybuilder === 'Percentage'
                        ? '%'
                        : ''})
                    </Typography>
                  </Grid>
                </Grid>
              ) : (
                ''
              )}

            {this.state.primaryProfileBilling &&
              this.state.primaryProfileBilling.restrictionsActual
                .length > 0 && (
                <Typography
                  type="body2"
                  className="font-medium font-uppercase"
                  style={{
                    marginTop: '.75em',
                    marginBottom: '.75em',
                  }}
                >
                  Restrictions
                </Typography>
              )}

            {this.state.primaryProfileBilling &&
              this.state.primaryProfileBilling.restrictionsActual
                .length > 0
              ? this.state.primaryProfileBilling.restrictionsActual.map(
                (e, i) => (
                  <Grid container key={i}>
                    <Grid item xs={12} sm={6}>
                      <Typography type="subheading">
                        {e.title}
                          {e.discountOrExtraType && (
                              <span>
                                    (
                                      {e.discountOrExtraType ===
                                          'Fixed amount'
                                          ? '$'
                                      : ''}
                                        {parseFloat(e.extra).toFixed(2)}
                                        {e.discountOrExtraType === 'Percentage'
                                          ? '%'
                                      : ''}
                                    )
                            </span>
                          )}

                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography
                        type="subheading"
                        style={{ textAlign: 'right' }}
                      >
                        ${parseFloat(this.state.primaryProfileBilling.restrictionsSurcharges[i]).toFixed(2)}
                      </Typography>
                    </Grid>
                  </Grid>
                ),
              )
              : ''}

            {/* this.state.primaryProfileBilling &&
                      this.state.primaryProfileBilling
                        .specificRestrictionsActual.length > 0
                        ? this.state.primaryProfileBilling.specificRestrictionsActual.map(
                            (e, i) => (
                              <Grid container key={i}>
                                <Grid item xs={12} sm={6}>
                                  <Typography type="subheading">
                                    {e.title} ({e.discountOrExtraType ==
                                    "Fixed amount"
                                      ? "$"
                                      : ""}
                                    {e.extra}
                                    {e.discountOrExtraType == "Percentage"
                                      ? "%"
                                      : ""})
                                  </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <Typography
                                    type="subheading"
                                    style={{ textAlign: "right" }}
                                  >
                                    ${
                                      this.state.primaryProfileBilling
                                        .specificRestrictionsSurcharges[i]
                                    }
                                  </Typography>
                                </Grid>
                              </Grid>
                            )
                          )
                        : "" */}

            {this.state.secondaryProfilesBilling
              ? this.state.secondaryProfilesBilling.map((e, i) => (
                <div>
                  <Typography
                    type="title"
                    style={{
                      marginTop: '.75em',
                      marginBottom: '.75em',
                    }}
                  >
                    {e.lifestyle.title}
                  </Typography>

                  <Grid container>
                    <Grid item xs={6}>
                      <Typography type="subheading">
                        {`${e.breakfast.totalQty +
                          e.lunch.totalQty +
                          e.dinner.totalQty +
                          e.chefsChoiceBreakfast.totalQty +
                          e.chefsChoiceLunch.totalQty +
                          e.chefsChoiceDinner.totalQty} meals`}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography
                        type="subheading"
                        style={{ textAlign: 'right' }}
                      >
                        ${parseFloat(e.breakfast.totalQty * e.breakfastPrice +
                          e.lunch.totalQty * e.lunchPrice +
                          e.dinner.totalQty * e.dinnerPrice +
                          e.chefsChoiceBreakfast.totalQty * e.chefsChoiceBreakfastPrice +
                          e.chefsChoiceLunch.totalQty * e.chefsChoiceLunchPrice +
                          e.chefsChoiceDinner.totalQty * e.chefsChoiceDinnerPrice).toFixed(2)}
                      </Typography>
                    </Grid>
                  </Grid>
                  {/* discount secondary = */}
                  {e.discountActual &&
                    e.discountActual > 0 && (
                      <Grid container>
                        <Grid item xs={12}>
                          <Typography
                            type="body2"
                            className="font-medium font-uppercase"
                            style={{ marginTop: '.75em' }}
                          >
                            Discount
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography type="subheading">
                            {e.discount.charAt(0).toUpperCase() +
                              e.discount.substr(
                                1,
                                e.discount.length,
                              )}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography
                            type="subheading"
                            style={{ textAlign: 'right' }}
                          >
                            -${parseFloat(e.discountActual).toFixed(2)}{' '}
                          </Typography>
                        </Grid>
                      </Grid>
                    )}

                  {e.totalAthleticSurcharge > 0 ||
                    e.totalBodybuilderSurcharge > 0 ? (
                      <Grid item xs={12}>
                        <Typography
                          type="body2"
                          className="font-medium font-uppercase"
                          style={{ marginTop: '.75em' }}
                        >
                          Extra
                        </Typography>
                      </Grid>
                    ) : (
                      ''
                    )}

                  {e.totalAthleticSurcharge > 0 ? (
                    <Grid container>
                      <Grid item xs={6}>
                        <Typography type="subheading">
                          Athletic
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography
                          type="subheading"
                          style={{ textAlign: 'right' }}
                        >
                          ${parseFloat(e.totalAthleticSurcharge).toFixed(2)} ({e.lifestyle
                            .discountOrExtraTypeAthletic ===
                            'Fixed amount'
                            ? '$'
                            : ''}
                          {parseFloat(e.lifestyle.extraAthletic).toFixed(2)}
                          {e.lifestyle
                            .discountOrExtraTypeAthletic ===
                            'Percentage'
                            ? '%'
                            : ''})
                        </Typography>
                      </Grid>
                    </Grid>
                  ) : (
                      ''
                    )}

                  {e.totalBodybuilderSurcharge > 0 ? (
                    <Grid container>
                      <Grid item sm={6} xs={12}>
                        <Typography type="subheading">
                          Bodybuilder
                        </Typography>
                      </Grid>
                      <Grid item sm={6} xs={12}>
                        <Typography
                          type="subheading"
                          style={{ textAlign: 'right' }}
                        >
                          ${parseFloat(e.totalBodybuilderSurcharge).toFixed(2)} ({e
                            .lifestyle
                            .discountOrExtraTypeBodybuilder ===
                            'Fixed amount'
                            ? '$'
                            : ''}
                          {parseFloat(e.lifestyle.extraBodybuilder).toFixed(2)}
                          {e.lifestyle
                            .discountOrExtraTypeBodybuilder ===
                            'Percentage'
                            ? '%'
                            : ''})
                        </Typography>
                      </Grid>
                    </Grid>
                  ) : (
                      ''
                    )}

                  {e.restrictionsActual.length > 0 && (
                    <Typography
                      type="body2"
                      className="font-medium font-uppercase"
                      style={{
                        marginTop: '.75em',
                        marginBottom: '.75em',
                      }}
                    >
                      Restrictions
                    </Typography>
                  )}

                  {e.restrictionsActual.length > 0 &&
                    e.restrictionsActual.map((el, ind) => (
                      <Grid container key={ind}>
                        <Grid item xs={12} sm={6}>
                          <Typography type="subheading">
                            {el.title}
                              {el.discountOrExtraType && (
                                  <span>
                                        (
                                          {el.discountOrExtraType ===
                                          'Fixed amount'
                                          ? '$'
                                          : ''}
                                            {parseFloat(el.extra).toFixed(2)}
                                            {el.discountOrExtraType === 'Percentage'
                                              ? '%'
                                              : ''}
                                        )
                                  </span>
                              )}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography
                            type="subheading"
                            style={{ textAlign: 'right' }}
                          >
                            ${parseFloat(e.restrictionsSurcharges[ind]).toFixed(2)}
                          </Typography>
                        </Grid>
                      </Grid>
                    ))}

                  {/* e.specificRestrictionsActual.length > 0 &&
                                e.specificRestrictionsActual.map((el, ind) => (
                                  <Grid container key={ind}>
                                    <Grid item xs={12} sm={6}>
                                      <Typography type="subheading">
                                        {el.title} ({el.discountOrExtraType ==
                                        "Fixed amount"
                                          ? "$"
                                          : ""}
                                        {el.extra}
                                        {el.discountOrExtraType == "Percentage"
                                          ? "%"
                                          : ""})
                                      </Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                      <Typography
                                        type="subheading"
                                        style={{ textAlign: "right" }}
                                      >
                                        ${e.specificRestrictionsSurcharges[ind]}
                                      </Typography>
                                    </Grid>
                                  </Grid>
                                )) */}
                </div>
              ))
              : ''}

            {/*  delivery and other stuff  */}
            <Grid container>
              <Grid item xs={6}>
                <Typography type="subheading">Delivery</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography
                  type="subheading"
                  style={{ textAlign: 'right' }}
                >
                  {this.state.primaryProfileBilling &&
                    this.state.primaryProfileBilling.deliveryCost > 0
                    ? `$${
                    this.state.primaryProfileBilling.deliveryCost
                    }`
                    : 'Free'}
                </Typography>
              </Grid>
            </Grid>

            {this.state.primaryProfileBilling &&
              this.state.primaryProfileBilling.deliverySurcharges >
              0 && (
                <Grid container>
                  <Grid item xs={6}>
                    <Typography type="subheading">
                      Delivery Surcharge (${
                        this.props.postalCodes.find(
                          el =>
                            el.title ===
                            this.props.customerInfo.postalCode.substring(
                              0,
                              3,
                            ),
                        ).extraSurcharge
                      })
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography
                      type="subheading"
                      style={{ textAlign: 'right' }}
                    >
                      {this.state.primaryProfileBilling &&
                        this.state.primaryProfileBilling
                          .deliverySurcharges > 0
                        ? `$${this.state.primaryProfileBilling.deliverySurcharges.toFixed(2)}`
                        : ''}
                    </Typography>
                  </Grid>
                </Grid>
              )}

            {this.state.primaryProfileBilling.discountTotal > 0 && !this.props.discountBeingRemoved ? (
              <div style={{ marginTop: '25px' }}>
                <Grid container>
                  <Grid item xs={12}>
                    <Typography type="title">Discount</Typography>
                  </Grid>
                </Grid>
                <Grid container>
                  <Grid item xs={12} sm={6}>
                    <Typography type="body2">
                      {this.props.discountSelected 
                      && this.props.discounts 
                      && this.props.discounts.find(e => this.props.discountSelected === e.title || this.props.discountSelected === e._id).title}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography
                      type="subheading"
                      style={{ textAlign: 'right' }}
                    >
                      -${parseFloat(this.state.primaryProfileBilling.discountTotal).toFixed(2)}
                    </Typography>
                  </Grid>
                </Grid>
              </div>
            ) : ''}

            {this.state.primaryProfileBilling &&
              this.state.primaryProfileBilling.coolerBag > 0 && (
                <Grid container>
                  <Grid item xs={6}>
                    <Typography type="subheading">
                      Cooler bag
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography
                      type="subheading"
                      style={{ textAlign: 'right' }}
                    >
                      {/* $20.00 */}
                      $0
                    </Typography>
                  </Grid>
                </Grid>
              )}

            <Typography
              type="title"
              className="font-medium font-uppercase"
              style={{ marginTop: '.75em', marginBottom: '.75em' }}
            >
              Price
            </Typography>

            {!this.state.taxExempt ? (
              <Grid container>
                <Grid item xs={12} sm={6}>
                  <Typography type="title">Taxes</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography
                    type="subheading"
                    style={{ textAlign: 'right' }}
                  >
                    ${this.state.primaryProfileBilling &&
                      parseFloat(this.state.primaryProfileBilling.taxes).toFixed(2)}
                  </Typography>
                </Grid>
              </Grid>
            ) : (
                ''
              )}
            <Grid container>
              <Grid item xs={12} sm={6}>
                <Typography type="title">Total</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography
                  type="display1"
                  style={{
                    textAlign: 'right',
                    color: '#000',
                  }}
                >
                  {this.state.taxExempt
                    ? this.state.primaryProfileBilling &&
                    `$${parseFloat(this.state.primaryProfileBilling
                      .groupTotal -
                    this.state.primaryProfileBilling.taxes).toFixed(2)}/week`
                    : this.state.primaryProfileBilling &&
                    `$${
                    parseFloat(this.state.primaryProfileBilling.groupTotal).toFixed(2)
                    }/week`}
                </Typography>
              </Grid>
            </Grid>
            {/* Container Price  */}
          </Grid>
        </Grid>
      </div>
    );
  }
}

// For more information, see our <a href="/terms">Terms</a>.

export default OrderSummary;
