import React, { Component } from 'react'
import {
  Grid, Label, Icon, Transition
} from 'semantic-ui-react'

import WalletInfo from "../Wallet/WalletInfo"

import styles from './container.module.css'


export default class StickyLayout extends Component {
  state = { visible: true }

  toggleVisibility = () =>
    this.setState((prevState) => ({ visible: !prevState.visible }))

  render() {
    const { visible } = this.state

    return (
      <div className={styles.contentStyle}>
        <Grid columns="2">
          <Grid.Column>
            {
              React.Children.map(this.props.children, (child, i) => {
                return React.cloneElement(child, {})
              })
            }
          </Grid.Column>
        </Grid>


        <div className={styles.walletWrapper}  >
          <br></br>
          <Label as='a' attached='top left' onClick={this.toggleVisibility}><Icon name="credit card outline icon" />Status</Label>
          <Transition.Group animation='drop' duration={1000}>
            {visible && (
              <WalletInfo />
            )}
           </Transition.Group>
        </div>

      </div>
      



    )
  }
}
