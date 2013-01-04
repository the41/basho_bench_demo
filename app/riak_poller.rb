#!/usr/bin/env ruby

require 'rubygems'
require 'statsd'
require 'net/http'
require 'uri'
require 'json'

statsd = Statsd.new
riak_rpc_path = '/opt/app/riak_rpc_fetch'

nodes = {'node_1' => '10.34.94.11', 'node_2' => '10.78.194.106', 'node_3' => '10.204.214.109', 'node_4' => '10.40.107.127'}

stats = ['vnode_gets', 'vnode_puts', 'read_repairs', 'node_gets', 'node_puts', 'cpu_nprocs', 'sys_process_count', 'pbc_connects', 'pbc_active', 
  'node_get_fsm_time_mean', 'node_get_fsm_time_median', 'node_get_fsm_time_95', 'node_get_fsm_time_99', 'node_get_fsm_time_100', 
  'node_put_fsm_time_mean', 'node_put_fsm_time_median', 'node_put_fsm_time_95', 'node_put_fsm_time_99', 'node_put_fsm_time_100']

loop do
  nodes.each do |node, ip|
    prefix = "#{node}.riak"

    # Test if node is up
    ping_uri = URI.parse("http://#{ip}:8098/ping")

    begin
      ping = Net::HTTP.get_response(ping_uri).body
    rescue Exception
      # skip the down nodes
      next
    end

    # Riak Stats
    stats_uri = URI.parse("http://#{ip}:8098/stats")

    begin
      status = JSON.parse(Net::HTTP.get_response(stats_uri).body)
    rescue Exception
      status = {}
    end

    stats.each do |stat|
      statsd.gauge("#{prefix}.#{stat}", status[stat].to_i)
    end

    # Transfers
    handoffs_command = "#{riak_rpc_path} riak@#{ip} riak_kv_status transfers | grep #{ip} | cut -f3 -d \"'\" | tr -cd [:alnum:]"

    handoffs = %x(#{handoffs_command}).to_s.strip 
    if(handoffs.empty?)
      handoffs = 0
    end
    statsd.gauge("#{prefix}.handoffs", handoffs)

    # Vnode Count
    vnode_command = "#{riak_rpc_path} riak@#{ip} riak_core_vnode_manager all_vnodes | grep -c kv_vnode"

    vnodes = %x(#{vnode_command}).to_s.strip 
    statsd.gauge("#{prefix}.primary_vnodes", vnodes)

    # Object Count
    object_uri = URI.parse("http://#{ip}:8098/buckets/bench/keys?keys=stream")

    begin
      object_count = Net::HTTP.get_response(object_uri).body.split(%r{"\d+"}).length - 1
    rescue Exception
      next
    end

    statsd.gauge("cluster.riak.object_count", object_count)
  end

  sleep 1
end