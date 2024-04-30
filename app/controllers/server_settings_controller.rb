# frozen_string_literal: true

class ServerSettingsController < ApplicationController
  def index
    server_settings = Patchwork::ServerSetting.where(parent_id: nil).includes(:children)

    # user_settings = current_user ? Patchwork::UserServerSetting.where(user_id: current_user.id) : []

    # server_setting_data = server_settings.each_with_object({}) do |setting, data|
    #   category = setting.name
    #   data[category] ||= {}

    #   setting.children.each do |child_setting|
    #     data[category][child_setting.name] = child_setting.value

    #     user_setting = user_settings.find { |us| us.server_setting.id == child_setting.id }
    #     data[category][child_setting.name] = user_setting&.value if user_setting
    #   end
    # end

    server_setting_data = {}

    server_settings.each do |server_setting|
      category = server_setting.name
      server_setting_data[category] ||= {}

      server_setting.children.each do |child_setting|
        server_setting_data[category][child_setting.name] = child_setting.value
      end
    end

    # Respond with JSON
    respond_to do |format|
      format.json do
        render json: server_setting_data, content_type: 'application/activity+json'
      end
    end
  end
end
