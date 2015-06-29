# -*- mode: ruby -*-
# vi: set ft=ruby :

# All Vagrant configuration is done below. The "2" in Vagrant.configure
# configures the configuration version (we support older styles for
# backwards compatibility). Please don't change it unless you know what
# you're doing.
Vagrant.configure(2) do |config|
	# The most common configuration options are documented and commented below.
	# For a complete reference, please see the online documentation at
	# https://docs.vagrantup.com.

	# Every Vagrant development environment requires a box. You can search for
	# boxes at https://atlas.hashicorp.com/search.
	config.vm.box = "hashicorp/precise32"

	# SSH conf
	config.ssh.username = "vagrant"
	config.ssh.password = "vagrant"

	# Disable automatic box update checking. If you disable this, then
	# boxes will only be checked for updates when the user runs
	# `vagrant box outdated`. This is not recommended.
	# config.vm.box_check_update = false


	# Port forwarding

	# Override SSH port (avoid corporate firewall)
	config.vm.network "forwarded_port", guest: 22, host: 2222, id: "ssh", disabled: true
	config.vm.network "forwarded_port", guest: 22, host: 8022
	config.ssh.port = 8022

	# HTTP
	config.vm.network "forwarded_port", guest: 8080, host: 8080

	# SMTP
	config.vm.network "forwarded_port", guest: 25, host: 8025

	# IMAP
	config.vm.network "forwarded_port", guest: 143, host: 8143


	# Create a private network, which allows host-only access to the machine
	# using a specific IP.
	config.vm.network "private_network", type: "dhcp"

	# Create a public network, which generally matched to bridged network.
	# Bridged networks make the machine appear as another physical device on
	# your network.
	# config.vm.network "public_network"

	# Shared folders
	config.vm.synced_folder ".", "/vagrant"
	#config.vm.synced_folder "./", "/vagrant/", type: "nfs", mount_options: [ 'rw', 'vers=3', 'tcp' ]


	# Provider
	config.vm.provider "virtualbox" do |v|
		v.name = "erizo-webmail-api"

		# Give VM 1/4 system memory & access to all cpu cores on the host
		host = RbConfig::CONFIG['host_os']
		if host =~ /darwin/
			cpus = `sysctl -n hw.ncpu`.to_i
		elsif host =~ /linux/
			cpus = `nproc`.to_i
		else # sorry Windows folks, I can't help you
			cpus = 1
		end

		v.customize ["modifyvm", :id, "--memory", 512]
		v.customize ["modifyvm", :id, "--cpus", cpus]
	end


	# Provisioning
	config.vm.provision "shell", inline: "/vagrant/scripts/provision.sh"
end



