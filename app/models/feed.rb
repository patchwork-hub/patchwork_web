# frozen_string_literal: true

class Feed
  include Redisable

  def initialize(type, id)
    @type = type
    @id   = id
  end

  def get(limit, max_id = nil, since_id = nil, min_id = nil)
    limit    = limit.to_i
    max_id   = max_id.to_i if max_id.present?
    since_id = since_id.to_i if since_id.present?
    min_id   = min_id.to_i if min_id.present?

    from_redis(limit, max_id, since_id, min_id)
  end

  protected

  def from_redis(limit, max_id, since_id, min_id)
    max_id = '+inf' if max_id.blank?
    if min_id.blank?
      since_id   = '-inf' if since_id.blank?
      unhydrated = redis.zrevrangebyscore(key, "(#{max_id}", "(#{since_id}", limit: [0, limit], with_scores: true).map { |id| id.first.to_i }
    else
      unhydrated = redis.zrangebyscore(key, "(#{min_id}", "(#{max_id}", limit: [0, limit], with_scores: true).map { |id| id.first.to_i }
    end

    # start::original code
    # Status.where(id: unhydrated).cache_ids
    # end::original code

    # start::mkk edited code
    banned_ids = []
    if server_setting?
      banned_ids = keyword_filters_scope
    end

    statuses = Status.where(id: unhydrated)
    statuses = statuses.where.not(id: banned_ids) if banned_ids.any?
    statuses.cache_ids
    # end::mkk edited code

  end

  def key
    FeedManager.instance.key(@type, @id)
  end

  def server_setting?
    content_filters = ServerSetting.where(name: "Content filters").last
    return false unless content_filters
    content_filters.value
  end

  def keyword_filters_scope
    banned_keyword_status_ids = []

    Status.order(created_at: :desc).limit(400).each do |status|
      KeywordFilter.all.each do |keyword_filter|

        if keyword_filter.is_filter_hashtag
          keyword = keyword_filter.keyword.downcase
          tag = Tag.find_by(name: keyword.gsub('#', ''))
          banned_keyword_status_ids << tag.statuses.ids if tag
        else
          banned_keyword_status_ids << status.id if status.search_word_ban(keyword_filter.keyword)
        end

      end
    end
  end
end
