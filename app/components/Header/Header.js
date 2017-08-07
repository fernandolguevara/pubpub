import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Avatar from 'components/Avatar/Avatar';

require('./header.scss');

const propTypes = {
	userName: PropTypes.string,
	userInitials: PropTypes.string,
	userSlug: PropTypes.string,
	userAvatar: PropTypes.string,
	userIsAdmin: PropTypes.bool,

	pageSlug: PropTypes.string.isRequired,
	pageBackground: PropTypes.string,

	appLogo: PropTypes.string.isRequired,
};

const defaultProps = {
	userName: undefined,
	userInitials: undefined,
	userSlug: undefined,
	userAvatar: undefined,
	userIsAdmin: undefined,
	pageBackground: undefined
};

const Header = function(props) {
	const loggedIn = !!props.userSlug;
	const isHome = props.pageSlug === '';
	const showGradient = isHome && !!props.pageBackground;

	return (
		<nav className={`header ${showGradient ? 'header-gradient' : 'accent-background accent-color'}`}>
			<div className={'container'}>
				<div className={'row'}>
					<div className={'col-12'}>
						{!isHome &&
							<div className={'headerItems headerItemsLeft'}>
								<img alt={'header logo'} className={'headerLogo'} src={props.appLogo} />
							</div>
						}
						<div className={'headerItems headerItemsRight'}>
							<Link to={'/search'} className="pt-button pt-large pt-minimal pt-icon-search" />
							{props.userIsAdmin &&
								<Link to={'/admin'} className="pt-button pt-large pt-minimal pt-icon-page-layout" />
							}
							{loggedIn &&
								<button className="pt-button pt-large pt-minimal avatar-button">
									<Avatar
										userInitials={props.userInitials}
										userAvatar={props.userAvatar}
										width={30}
									/>
								</button>
							}
							{!loggedIn &&
								<Link to={'/login'} className="pt-button pt-large pt-minimal">Login or Signup</Link>
							}
						</div>
					</div>
				</div>
			</div>
		</nav>
	);
};

Header.defaultProps = defaultProps;
Header.propTypes = propTypes;
export default Header;
