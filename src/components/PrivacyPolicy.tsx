import React from 'react';
const PrivacyPolicy: React.FC = () => {
  return (
    <div className="prose dark:prose-invert max-w-2xl mx-auto my-8">
      <h1>{"privacy_policy.title"}</h1>
      <p>
        {"privacy_policy.introduction"}
      </p>
      <h3>{"privacy_policy.data_collection.title"}</h3>
      <ul>
        <li><b>{"privacy_policy.data_collection.account_info.title"}:</b> {"privacy_policy.data_collection.account_info.description"}</li>
        <li><b>{"privacy_policy.data_collection.usage_data.title"}:</b> {"privacy_policy.data_collection.usage_data.description"}</li>
      </ul>
      <h3>{"privacy_policy.data_usage.title"}</h3>
      <ul>
        <li>{"privacy_policy.data_usage.purpose"}</li>
        <li>{"privacy_policy.data_usage.commercial_advertising"}</li>
      </ul>
      <h3>{"privacy_policy.data_sharing.title"}</h3>
      <ul>
        <li>{"privacy_policy.data_sharing.no_sharing"}</li>
      </ul>
      <h3>{"privacy_policy.security.title"}</h3>
      <ul>
        <li>{"privacy_policy.security.password_encrypted"}</li>
        <li>{"privacy_policy.security.security_measures"}</li>
      </ul>
      <h3>{"privacy_policy.your_rights.title"}</h3>
      <ul>
        <li>{"privacy_policy.your_rights.deletion_modification"}</li>
      </ul>
      <h3>{"privacy_policy.contact.title"}</h3>
      <p>
        {"privacy_policy.contact.email_address"}: <b>{"privacy_policy.contact.email_address_value"}</b>
      </p>
    </div>
  );
};

export default PrivacyPolicy; 