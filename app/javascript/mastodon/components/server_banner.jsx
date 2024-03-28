import PropTypes from 'prop-types';
import { PureComponent} from 'react';

import { FormattedMessage, defineMessages, injectIntl } from 'react-intl';

import { Link } from 'react-router-dom';

import { connect } from 'react-redux';

import { fetchServer } from 'mastodon/actions/server';
import { ServerHeroImage } from 'mastodon/components/server_hero_image';
import { ShortNumber } from 'mastodon/components/short_number';
import { Skeleton } from 'mastodon/components/skeleton';
import Account from 'mastodon/containers/account_container';
import { domain } from 'mastodon/initial_state';
import 'styles/mastodon/side_bar_server_setting.scss';

const messages = defineMessages({
  aboutActiveUsers: { id: 'server_banner.about_active_users', defaultMessage: 'People using this server during the last 30 days (Monthly Active Users)' },
});

const mapStateToProps = state => ({
  server: state.getIn(['server', 'server']),
});

const settingsData = {
  "Spam Block": ["Spam filters", "Sign up challenge"],
  "Content Moderation": ["Content filters", "Live blocklist"],
  "Federation": ["Bluesky", "Threads"],
  "Local Features": [
    "Custom theme",
    "Search opt-out",
    "Local only posts",
    "Long posts and Markdown",
    "Local quote posts"
  ],
  "User Management": ["Guest Accounts", "e-Newsletters", "Analytics"],
  "Plug-ins": [""]
};

class ServerBanner extends PureComponent {
  constructor(props) {
    super(props);
    
    
    const initialState = Object.entries(settingsData).reduce((acc, [category, options]) => {
      acc[category] = options.map(option => ({
        name: option,
        checked: option !== "Local only posts" && option !== "Live blocklist" && option !== "Analytics" && option !== "Threads",
      }));
      return acc;
    }, {});
  
    this.state = {
      activeIndex: 2,
      settings: initialState, 
    };
    
    this.handleItemClick = this.handleItemClick.bind(this);
    this.toggleCheckbox = this.toggleCheckbox.bind(this); 
  }
  

  static propTypes = {
    server: PropTypes.object,
    dispatch: PropTypes.func,
    intl: PropTypes.object,
  };

  handleItemClick(index) {
    this.setState((prevState) => ({
      activeIndex: prevState.activeIndex === index ? null : index,
    }));
  }

  toggleCheckbox(category, optionIndex) {
  this.setState(prevState => {
    const newSettings = { ...prevState.settings };
    newSettings[category][optionIndex].checked = !newSettings[category][optionIndex].checked;

    return { settings: newSettings };
  });
}
  
  componentDidMount () {
    const { dispatch } = this.props;
    dispatch(fetchServer());
  }

  render () {
    const { server, intl } = this.props;
    const isLoading = server.get('isLoading');

    return (
      <div className='server-banner'>
        <div className='server-banner__introduction'>
          <FormattedMessage id='server_banner.introduction' defaultMessage='{domain} is part of the decentralized social network powered by {mastodon}, running on {patchwork}.' values={{ domain: <strong>{domain}</strong>, mastodon: <a href='https://joinmastodon.org' target='_blank'>Mastodon</a>, patchwork: <a href='https://github.com/newsmast22/patchwork_web' target='_blank'>Patchwork</a> }} />
        </div>

        <ServerHeroImage blurhash={server.getIn(['thumbnail', 'blurhash'])} src={server.getIn(['thumbnail', 'url'])} className='server-banner__hero' />

        <div className='server-banner__description'>
          {isLoading ? (
            <>
              <Skeleton width='100%' />
              <br />
              <Skeleton width='100%' />
              <br />
              <Skeleton width='70%' />
            </>
          ) : server.get('description')}
        </div>

        <div className='server-banner__meta'>
          <div className='server-banner__meta__column'>
            <h4><FormattedMessage id='server_banner.administered_by' defaultMessage='Administered by:' /></h4>

            <Account id={server.getIn(['contact', 'account', 'id'])} size={36} minimal />
          </div>

          <div className='server-banner__meta__column'>
            <h4><FormattedMessage id='server_banner.server_stats' defaultMessage='Server stats:' /></h4>

            {isLoading ? (
              <>
                <strong className='server-banner__number'><Skeleton width='10ch' /></strong>
                <br />
                <span className='server-banner__number-label'><Skeleton width='5ch' /></span>
              </>
            ) : (
              <>
                <strong className='server-banner__number'><ShortNumber value={server.getIn(['usage', 'users', 'active_month'])} /></strong>
                <br />
                <span className='server-banner__number-label' title={intl.formatMessage(messages.aboutActiveUsers)}><FormattedMessage id='server_banner.active_users' defaultMessage='active users' /></span>
              </>
            )}
          </div>
        </div>

        <hr className='spacer' />

        <Link className='button button--block button-secondary' to='/about'><FormattedMessage id='server_banner.learn_more' defaultMessage='Learn more' /></Link>

        {/* <HeaderComponent/> */}
        
        <div style={{marginTop: "1rem"}}>SERVER SETTINGS:</div>
        {/* server settings */}
        <div className='server-settings-style' style={{border: "1px solid #333", padding: "5px", marginTop: "0.5rem"}}>
          {Object.entries(settingsData).map(([category, options], index) => (
            <div key={index} className={`accordion-item ${Object.keys(settingsData).length - 1 == index ? "mb-0" : "mb-05"}`}>
              {/* <small onClick={() => handleItemClick(index)} className="title"> */}
              <small  className="" style={{display: "flex", alignItems: "center", margin: "0", marginBottom: "0.3rem",gap: "0.3rem",fontWeight: "bold",cursor: "pointer", }}  onClick={() => this.handleItemClick(index)}>
                <input type="checkbox" className="side_bar_custom-checkbox" checked={true} />
                <span>{category}</span>
              </small>
              {this.state.activeIndex === index && (
                <ul
                  style={{ listStyleType: "none", paddingLeft: "0", margin: "0" }}
                >
                  {options.map((option, optionIndex) => (
                    option.trim() !== "" && (
                      <li key={optionIndex} style={{ marginLeft: "1.3rem", marginBottom: "0.3rem"}}>
                        {JSON.stringify(option.checked)}
                        <label style={{display: "flex", alignItems: "center"}}>
                          <input
                            type="checkbox"
                            className="side_bar_custom-checkbox"
                            checked={this.state.settings[category][optionIndex].checked} 
                            onChange={() => this.toggleCheckbox(category, optionIndex)}
                          />
                          <small>{option}</small>
                        </label>
                      </li>
                    )
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
        {/* <button className='button button--block button-secondary' style={{ marginTop: "1rem"}}>See more</button> */}
        <Link to={{pathname: `/about`,state: { fromSidebar: true }}} className='button button--block button-secondary' style={{ marginTop: "1rem"}}>See more</Link>
      </div>
    );
  }

}

export default connect(mapStateToProps)(injectIntl(ServerBanner));
