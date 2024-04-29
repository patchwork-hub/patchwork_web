class UserServerSettingsController < ApplicationController
  before_action :authenticate_user!, only: [:customize_setting]

  def index
    server_settings = Patchwork::ServerSetting.where(parent_id: nil).includes(:children)
  
    user_settings = current_user ? Patchwork::UserServerSetting.where(user_id: current_user.id) : []
  
    server_setting_data = server_settings.each_with_object({}) do |setting, data|
      category = setting.name
      data[category] ||= {}
  
      setting.children.each do |child_setting|
        data[category][child_setting.name] = child_setting.value
  
        user_setting = user_settings.find { |us| us.server_setting.id == child_setting.id }
        data[category][child_setting.name] = user_setting&.value if user_setting
      end
    end

    # Respond with JSON
    respond_to do |format|
      format.json do
        render json: server_setting_data, content_type: 'application/activity+json'
      end
    end
  end

  def customize_setting
    user_setting = Patchwork::UserServerSetting.find_by(
      user_id: current_user.id,
      server_setting_id: params[:server_setting_id]
    )
    if user_setting
      if user_setting.value != params[:value]
        user_setting.update(value: params[:value])
      end
    else
      Patchwork::UserServerSetting.create!(user_id: current_user.id, server_setting_id: params[:server_setting_id], value: params[:value])
    end
  end
  
end
