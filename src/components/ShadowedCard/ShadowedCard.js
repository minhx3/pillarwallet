// @flow
/*
    Pillar Wallet: the personal data locker
    Copyright (C) 2019 Stiftung Pillar Project

    This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation; either version 2 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License along
    with this program; if not, write to the Free Software Foundation, Inc.,
    51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
*/

import * as React from 'react';
import styled, { withTheme } from 'styled-components/native';
import { Animated, TouchableWithoutFeedback, View } from 'react-native';
import { Shadow } from 'components/Shadow';
import { themedColors, getThemeType } from 'utils/themes';
import { noop } from 'utils/common';
import { DARK_THEME } from 'constants/appSettingsConstants';
import type { Theme } from 'models/Theme';

const CardOutter = styled.View`
  position: relative;
`;

const ContentWrapper = styled.View`
  flex-direction: column;
  justify-content: flex-start;
  border-radius: 6px;
  background: ${themedColors.card};
  width: 100%;
  opacity: ${({ disabled, opacity }) => disabled ? 0.6 : opacity};
  ${({ isAnimated }) => isAnimated && `
    position: absolute;
    top: 0;
    left: 0;
  `}
`;

const AnimatedCardOutter = Animated.createAnimatedComponent(CardOutter);


type Props = {
  children: React.Node,
  wrapperStyle?: Object,
  contentWrapperStyle?: Object,
  upperContentWrapperStyle?: Object,
  onPress?: ?Function,
  disabled?: boolean,
  theme: Theme,
  isAnimated?: boolean,
  spacingAfterAnimation?: number,
}

type State = {
  cardHeight: ?number,
  cardWidth: ?number,
  allowRerenderShadow: boolean,
  scaleValue: Animated.Value,
  finishedAnimating: boolean,
  isAnimating: boolean,
}

const SHADOW_LENGTH = 3;

class ShadowedCard extends React.Component<Props, State> {
  cardOutterRef: View;

  state = {
    cardHeight: null,
    cardWidth: null,
    allowRerenderShadow: false,
    scaleValue: new Animated.Value(0.1),
    finishedAnimating: false,
    isAnimating: false,
  };

  componentDidUpdate(prevProps: Props) {
    if (prevProps.children !== this.props.children) {
      this.allowToRerenderShadow();
    }
  }

  shouldComponentUpdate(nextProps: Props, nextState: State) {
    const { isAnimated } = this.props;
    const { isAnimating } = nextState;
    return !isAnimated || !isAnimating;
  }

  allowToRerenderShadow = () => {
    this.setState({ allowRerenderShadow: true });
  };

  animate = () => {
    const { cardHeight } = this.state;
    const { spacingAfterAnimation = 0 } = this.props;
    this.cardOutterRef.setNativeProps({ height: cardHeight + spacingAfterAnimation });

    this.setState({ isAnimating: true });
    Animated.spring(this.state.scaleValue, { toValue: 1, useNativeDriver: true }).start(() => {
      this.setState({ isAnimating: false, finishedAnimating: true });
    });
  };

  render() {
    const {
      wrapperStyle = {},
      contentWrapperStyle,
      children,
      onPress,
      disabled,
      upperContentWrapperStyle = {},
      theme,
      isAnimated,
    } = this.props;
    const currentTheme = getThemeType(theme);
    const {
      cardHeight,
      cardWidth,
      allowRerenderShadow,
      finishedAnimating,
      scaleValue,
    } = this.state;
    const readyToRenderShadow = finishedAnimating || !isAnimated;
    const animatedContentOpacity = !cardHeight ? 0 : 1;
    const contentOpacity = isAnimated ? animatedContentOpacity : 1;
    return (
      <AnimatedCardOutter
        style={{ ...wrapperStyle, transform: [{ scaleY: isAnimated ? scaleValue : 1 }] }}
        ref={ref => { this.cardOutterRef = ref; }}
      >
        {!!(cardHeight && cardWidth) && readyToRenderShadow && currentTheme !== DARK_THEME &&
        <Shadow
          heightAndroid={cardHeight}
          heightIOS={cardHeight}
          widthIOS={cardWidth}
          widthAndroid={cardWidth}
          useSVGShadow
          wrapperStyle={{
            position: 'absolute',
            top: -(SHADOW_LENGTH / 2),
            left: -(SHADOW_LENGTH / 2),
            opacity: disabled ? 0.4 : 0.8,
          }}
          shadowRadius={4}
        />}
        <TouchableWithoutFeedback onPress={onPress}>
          <ContentWrapper
            disabled={disabled}
            style={upperContentWrapperStyle}
            isAnimated={isAnimated}
            opacity={contentOpacity}
          >
            <View
              style={contentWrapperStyle}
              onLayout={(e) => {
                if ((!cardHeight && !cardWidth) || allowRerenderShadow) {
                  this.setState({
                    cardHeight: e.nativeEvent.layout.height + SHADOW_LENGTH,
                    cardWidth: e.nativeEvent.layout.width + SHADOW_LENGTH,
                    allowRerenderShadow: false,
                  }, () => isAnimated ? this.animate() : noop());
                }
              }}
            >
              {children}
            </View>
          </ContentWrapper>
        </TouchableWithoutFeedback>
      </AnimatedCardOutter>
    );
  }
}

export default withTheme(ShadowedCard);
